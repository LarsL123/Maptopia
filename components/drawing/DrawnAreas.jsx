"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useMap, Polygon, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import getCategoryStyle from "./DrawnAreaCategory";

/*
  Important to understand. The data source of truth for drawn areas is the React state.
  The code is mostly about syncing Leaflet.pm polygons to our React GeoJSON data.
  Understand/refresh this when modifying the code.
*/

export default function DrawnAreas() {
  const map = useMap();
  const initializedRef = useRef(false);
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    fetch("/api/features")
      .then((res) => res.json())
      .then((data) => setFeatures(data))
      .catch((err) => console.error("Failed to load features:", err));
  }, []);

  useEffect(() => {
    if (!map) return;

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
    setTimeout(initializeControls, 100);

    map.on("pm:create", handleCreate(setFeatures));

    map.on("pm:remove", handleRemove(setFeatures));

    return () => {
      if (map.pm && initializedRef.current) {
        try {
          map.pm.removeControls();
        } catch (error) {
          console.error("DrawnAreas: Error removing controls", error);
        }
      }
      map.off("pm:create");
      map.off("pm:remove");
    };
  }, [map]);

  const handleAddLayer = useCallback(
    (feature) => (e) => {
      const layer = e.target;
      layer.feature = feature;

      // Remove duplicate listeners
      layer.off("pm:edit");

      const handleEdit = async () => {
        const id = layer.feature?.properties?.id;
        if (!id) return;

        const updatedGeoJSON = layer.toGeoJSON();

        setFeatures((prev) =>
          prev.map((f) =>
            f.properties.id === id
              ? { ...f, geometry: updatedGeoJSON.geometry }
              : f
          )
        );

        try {
          await fetch(`/api/features/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ geometry: updatedGeoJSON.geometry }),
          });
        } catch (err) {
          console.error("Failed to update feature:", err);
        }
      };

      layer.on("pm:edit", handleEdit);
      layer._pmEditHandler = handleEdit;
    },
    []
  );

  const handleRemoveLayer = useCallback((e) => {
    const layer = e.target;
    if (layer._pmEditHandler) {
      layer.off("pm:edit", layer._pmEditHandler);
      delete layer._pmEditHandler;
    }
  }, []);

  return (
    <>
      {features.map((feature) => (
        <Polygon
          key={feature.properties.id}
          //Important: Leaflet needs [lat, lng] while GeoJSON uses [lng, lat]
          positions={feature.geometry.coordinates[0].map(([lng, lat]) => [
            lat,
            lng,
          ])}
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
        </Polygon>
      ))}
    </>
  );
}

function handleCreate(setFeatures) {
  return async (e) => {
    const layer = e.layer;
    const geojson = layer.toGeoJSON();

    const newFeature = {
      ...geojson,
      properties: {
        id: `area-${Date.now()}`,
        title: "New Area",
        description: "Click to edit",
        category: "default",
        createdAt: new Date().toISOString(),
      },
    };

    // Optimistic update
    setFeatures((prev) => [...prev, newFeature]);
    layer.remove();

    try {
      await fetch("/api/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFeature),
      });
    } catch (err) {
      console.error("Failed to save feature:", err);
    }
  };
}

function handleRemove(setFeatures) {
  return async (e) => {
    const id = e.layer.feature?.properties?.id;
    if (!id) return;

    setFeatures((prev) => prev.filter((f) => f.properties.id !== id));

    try {
      await fetch(`/api/features/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete feature:", err);
    }
  };
}
