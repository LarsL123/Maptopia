"use client";

import { useEffect, useRef, useCallback } from "react";

import { useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import type * as L from "leaflet";

import { useDrawnFeatures } from "./DrawnFeaturesProvider";
import { useAuth } from "../auth/AuthProvider";
import {
  createFeature,
  deleteFeature,
  updateFeatureGeometry,
} from "../../lib/features";
import { type DrawnFeature } from "../../types/features";

type SetFeatures = React.Dispatch<React.SetStateAction<DrawnFeature[]>>;

export interface PmLayer {
  feature?: DrawnFeature;
  _pmEditHandler?: L.LeafletEventHandlerFn;
  toGeoJSON(): { geometry: DrawnFeature["geometry"] };
  on(type: string, fn: L.LeafletEventHandlerFn): void;
  off(type: string, fn?: L.LeafletEventHandlerFn): void;
  remove(): void;
}

export default function DrawingController() {
  const map = useMap();
  const initializedRef = useRef(false);
  const { setFeatures } = useDrawnFeatures();
  const { session } = useAuth();

  useEffect(() => {
    if (!map || !session) return;

    const initializeControls = () => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      map.pm.addControls({
        position: "topleft",
        drawCircle: false,
        drawCircleMarker: false,
        drawPolyline: false,
        drawMarker: false,
        drawText: false,
        cutPolygon: false,
      });
    };

    // Initialize after a short delay to ensure map is ready. If not controls won't show.
    const timer = setTimeout(initializeControls, 100);

    map.on("pm:create", onCreateFeature(setFeatures));
    map.on("pm:remove", onRemoveFeature(setFeatures));

    return () => {
      clearTimeout(timer);
      if (map.pm && initializedRef.current) {
        try {
          map.pm.removeControls();
        } catch (error) {
          console.error("DrawnAreas: Error removing controls", error);
        }
        initializedRef.current = false;
      }
      map.off("pm:create");
      map.off("pm:remove");
    };
  }, [map, session, setFeatures]);

  return null;
}

export function useLayerEditSync(setFeatures: SetFeatures) {
  const addEditListener = useCallback(
    (feature: DrawnFeature) => (e: L.LeafletEvent) => {
      const layer = e.target as PmLayer;
      layer.feature = feature;

      // Remove duplicate listeners
      layer.off("pm:edit");

      const handleEdit: L.LeafletEventHandlerFn = async () => {
        const id = layer.feature?.properties?.id;
        if (!id) return;

        const updatedGeoJSON = layer.toGeoJSON();

        setFeatures((prev) =>
          prev.map((f) =>
            f.properties.id === id
              ? { ...f, geometry: updatedGeoJSON.geometry }
              : f,
          ),
        );

        try {
          await updateFeatureGeometry(id, updatedGeoJSON.geometry);
        } catch (err) {
          console.error("Failed to update feature:", err);
        }
      };

      layer.on("pm:edit", handleEdit);
      layer._pmEditHandler = handleEdit;
    },
    [setFeatures],
  );

  const removeEditListener = useCallback((e: L.LeafletEvent) => {
    const layer = e.target as PmLayer;
    if (layer._pmEditHandler) {
      layer.off("pm:edit", layer._pmEditHandler);
      delete layer._pmEditHandler;
    }
  }, []);

  return {
    addEditListener,
    removeEditListener,
  };
}

function onCreateFeature(setFeatures: SetFeatures) {
  return async (e: L.LeafletEvent) => {
    const layer = (e as unknown as { layer: PmLayer }).layer;
    const geojson = layer.toGeoJSON();

    const tempId = `temp-${Date.now()}`;
    const optimistic: DrawnFeature = {
      id: tempId,
      type: "Feature",
      properties: {
        id: tempId,
        title: "New Area",
        description: "Click to edit",
        category: "default",
        createdAt: new Date().toISOString(),
        dynamicProperties: {},
      },
      geometry: geojson.geometry,
    };

    // Optimistic update
    setFeatures((prev) => [...prev, optimistic]);
    layer.remove();

    try {
      const saved = await createFeature({
        title: "New Area",
        description: "Click to edit",
        category: "default",
        geometry: geojson.geometry,
      });
      // Swap in the row Supabase returned so later edits use the real id.
      setFeatures((prev) =>
        prev.map((f) => (f.properties.id === tempId ? saved : f)),
      );
    } catch (err) {
      console.error("Failed to save feature:", err);
      setFeatures((prev) => prev.filter((f) => f.properties.id !== tempId));
    }
  };
}

function onRemoveFeature(setFeatures: SetFeatures) {
  return async (e: L.LeafletEvent) => {
    const layer = (e as unknown as { layer: { feature?: DrawnFeature } }).layer;
    const id = layer.feature?.properties?.id;
    if (!id) return;

    setFeatures((prev) => prev.filter((f) => f.properties.id !== id));

    try {
      await deleteFeature(id);
    } catch (err) {
      console.error("Failed to delete feature:", err);
    }
  };
}
