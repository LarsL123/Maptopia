"use client";

import { useEffect, useRef, useState } from "react";
import { useMap, Polygon, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

// Import and initialize Geoman
if (typeof window !== "undefined") {
  require("@geoman-io/leaflet-geoman-free");
}

// Mock GeoJSON data with drawn areas around the specified coordinates
const mockAreasData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "area-1",
        title: "Historical District",
        description: "Old town area with preserved buildings",
        category: "heritage",
        createdAt: "2025-01-15T10:00:00Z",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [10.340897, 63.422779],
            [10.348897, 63.422779],
            [10.348897, 63.418779],
            [10.340897, 63.418779],
            [10.340897, 63.422779],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "area-2",
        title: "Park Zone",
        description: "Green space and recreational area",
        category: "parks",
        createdAt: "2025-01-16T14:30:00Z",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [10.335897, 63.419779],
            [10.339897, 63.421779],
            [10.343897, 63.419779],
            [10.341897, 63.416779],
            [10.337897, 63.417779],
            [10.335897, 63.419779],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "area-3",
        title: "Development Zone",
        description: "Planned construction area",
        category: "development",
        createdAt: "2025-01-17T09:15:00Z",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [10.349897, 63.423779],
            [10.355897, 63.423779],
            [10.355897, 63.420779],
            [10.349897, 63.420779],
            [10.349897, 63.423779],
          ],
        ],
      },
    },
  ],
};

// Style function based on category
const getCategoryStyle = (category) => {
  const categoryStyles = {
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
    categoryStyles[category] || {
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
  const [drawnLayers, setDrawnLayers] = useState([]);

  // Convert GeoJSON coordinates [lon, lat] to Leaflet format [lat, lon]
  const convertCoordinates = (coordinates) => {
    return coordinates[0].map(([lon, lat]) => [lat, lon]);
  };

  // Convert mock data to polygon positions
  const polygons = mockAreasData.features.map((feature) => ({
    ...feature.properties,
    positions: convertCoordinates(feature.geometry.coordinates),
  }));

  useEffect(() => {
    if (!map) return;

    console.log("DrawnAreas: Map instance received", map);
    console.log("DrawnAreas: map.pm available?", !!map.pm);

    // Wait for map to be fully ready
    const initializeControls = () => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      console.log("DrawnAreas: Initializing Leaflet.pm controls");

      // Enable Leaflet.pm controls
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

    // Initialize after a short delay to ensure map is ready
    setTimeout(initializeControls, 100);

    // Event handler for newly created shapes
    map.on("pm:create", (e) => {
      const { layer } = e;

      // Default properties for new shapes
      const newFeature = {
        id: `area-${Date.now()}`,
        title: "New Area",
        description: "Click to edit description",
        category: "default",
        createdAt: new Date().toISOString(),
      };

      layer.feature = { properties: newFeature };

      // Apply default styling
      layer.setStyle(getCategoryStyle("default"));

      // Add popup
      const popupContent = `
        <div>
          <h3 style="margin: 0 0 8px 0; font-size: 16px;">${newFeature.title}</h3>
          <p style="margin: 0 0 4px 0; font-size: 14px;">${newFeature.description}</p>
          <p style="margin: 0; font-size: 12px; color: #666;">Category: ${newFeature.category}</p>
        </div>
      `;
      layer.bindPopup(popupContent);

      console.log("Created new area:", newFeature);
      setDrawnLayers((prev) => [...prev, { layer, feature: newFeature }]);
    });

    // Event handler for edited shapes
    map.on("pm:edit", (e) => {
      const { layer } = e;
      if (layer.feature) {
        console.log("Edited area:", layer.feature.properties);
      }
    });

    // Event handler for removed shapes
    map.on("pm:remove", (e) => {
      const { layer } = e;
      if (layer.feature) {
        console.log("Removed area:", layer.feature.properties);
        setDrawnLayers((prev) => prev.filter((item) => item.layer !== layer));
      }
    });

    // Cleanup
    return () => {
      console.log("DrawnAreas: Cleaning up");
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
      {polygons.map((polygon, index) => (
        <Polygon
          key={`${polygon.id}-${index}`}
          positions={polygon.positions}
          pathOptions={getCategoryStyle(polygon.category)}
          pmIgnore={false}
        >
          <Popup>
            <div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>
                {polygon.title}
              </h3>
              <p style={{ margin: "0 0 4px 0", fontSize: "14px" }}>
                {polygon.description}
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                Category: {polygon.category}
              </p>
            </div>
          </Popup>
        </Polygon>
      ))}
    </>
  );
}
