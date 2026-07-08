"use client";

import {
  useEffect,
  useRef,
  useCallback,
  type ComponentType,
  type ComponentProps,
} from "react";
import { useMap, Polygon, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import type * as L from "leaflet";
import getCategoryStyle from "./DrawnAreaCategory";
import { useDrawnFeatures } from "./DrawnFeaturesProvider";
import { useAuth } from "../auth/AuthProvider";
import {
  fetchFeatures,
  createFeature,
  deleteFeature,
  updateFeatureGeometry,
} from "../../lib/features";
import { type DrawnFeature } from "../../types/features";

/*
  Important to understand. The data source of truth for drawn areas is the React state.
  The code is mostly about syncing Leaflet.pm polygons to our React GeoJSON data.
  Understand/refresh this when modifying the code.

  Reads are public; the drawing toolbar (and thus all writes) only appears for
  signed-in users. RLS enforces ownership server-side either way.
*/

type SetFeatures = React.Dispatch<React.SetStateAction<DrawnFeature[]>>;

interface PmLayer {
  feature?: DrawnFeature;
  _pmEditHandler?: L.LeafletEventHandlerFn;
  toGeoJSON(): { geometry: DrawnFeature["geometry"] };
  on(type: string, fn: L.LeafletEventHandlerFn): void;
  off(type: string, fn?: L.LeafletEventHandlerFn): void;
  remove(): void;
}

// Polygon extended with pmIgnore prop from leaflet-geoman
const PmPolygon = Polygon as ComponentType<
  ComponentProps<typeof Polygon> & { pmIgnore?: boolean }
>;

export default function DrawnAreas() {
  const map = useMap();
  const initializedRef = useRef(false);
  const { features, setFeatures } = useDrawnFeatures();
  const { session } = useAuth();

  useEffect(() => {
    fetchFeatures()
      .then(setFeatures)
      .catch((err) => console.error("Failed to load features:", err));
  }, [setFeatures]);

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

    map.on("pm:create", handleCreate(setFeatures));
    map.on("pm:remove", handleRemove(setFeatures));

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

  const handleAddLayer = useCallback(
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

  const handleRemoveLayer = useCallback((e: L.LeafletEvent) => {
    const layer = e.target as PmLayer;
    if (layer._pmEditHandler) {
      layer.off("pm:edit", layer._pmEditHandler);
      delete layer._pmEditHandler;
    }
  }, []);

  if (features.length > 0) {
    return (
      <>
        {features.map((feature) => (
          <PmPolygon
            key={feature.properties.id}
            //Important: Leaflet needs [lat, lng] while GeoJSON uses [lng, lat].
            //Everything drawn here is a Polygon, hence the cast.
            positions={(
              feature.geometry.coordinates as [number, number][][]
            )[0].map(([lng, lat]) => [lat, lng] as [number, number])}
            pathOptions={getCategoryStyle(feature.properties.category)}
            pmIgnore={false} //Makes my polygons editable by Leaflet.pm
            eventHandlers={{
              //Had to be done here because I didn't get map.on("pm:edit") to work.
              add: handleAddLayer(feature),
              remove: handleRemoveLayer,
            }}
          >
            <Popup>
              <h3>{feature.properties.title}</h3>
              <p>{feature.properties.description}</p>
              <small>{feature.properties.category}</small>
            </Popup>
          </PmPolygon>
        ))}
      </>
    );
  } else {
    return "";
  }
}

function handleCreate(setFeatures: SetFeatures) {
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

function handleRemove(setFeatures: SetFeatures) {
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
