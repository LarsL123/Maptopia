"use client";

import { useEffect, useRef, useState } from "react";
import { useMap, Polygon, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

/*
  Important to understand. The data source of truth for drawn areas is the React state.
  The code is mostly about syncing Leaflet.pm polygons to our React GeoJSON data.
  Understand/refresh this when modifying the code.
*/

const getCategoryStyle = (category) => {
  const styles = {
    heritage: {
      color: "#8B4513",
      fillColor: "#D2691E",
      fillOpacity: 0.4,
      weight: 2,
    },
    parks: {
      color: "#228B22",
      fillColor: "#90EE90",
      fillOpacity: 0.4,
      weight: 2,
    },
    development: {
      color: "#4169E1",
      fillColor: "#87CEEB",
      fillOpacity: 0.4,
      weight: 2,
    },
  };
  return (
    styles[category] || {
      color: "#666",
      fillColor: "#ccc",
      fillOpacity: 0.4,
      weight: 2,
    }
  );
};

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

    // Initialize after a short delay to ensure map is ready. If not controlls wont show.
    setTimeout(initializeControls, 100);

    map.on("pm:create", async (e) => {
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
    });

    map.on("pm:edit", async (e) => {
      e.layers.eachLayer(async (layer) => {
        const id = layer.feature?.properties?.id;

        if (!id) return;

        const updatedGeoJSON = layer.toGeoJSON();

        //One edit could be to multiple features
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
      });
    });

    map.on("pm:remove", async (e) => {
      const id = e.layer.feature?.properties?.id;
      if (!id) return;

      setFeatures((prev) => prev.filter((f) => f.properties.id !== id));

      try {
        await fetch(`/api/features/${id}`, { method: "DELETE" });
      } catch (err) {
        console.error("Failed to delete feature:", err);
      }
    });

    return () => {
      if (map.pm && initializedRef.current) {
        try {
          map.pm.removeControls();
        } catch (error) {
          console.error("DrawnAreas: Error removing controls", error);
        }
      }
      map.off("pm:create");
      map.off("pm:edit");
      map.off("pm:remove");
    };
  }, [map]);

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
            add: (e) => {
              e.target.feature = feature; // This associates the Leaflet layer with its GeoJSON feature and is integral in edit/remove.
            },
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
