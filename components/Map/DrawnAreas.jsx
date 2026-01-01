"use client";

import { useEffect, useRef, useState } from "react";
import { useMap, Polygon, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

/*
  Importtant to undertand. The data source of truth for drawn areas is the React state. 
  The code is mostly about syncing Leaftlet.pm polygons to our React GeoJSON data. 
  Understand/refresh this when modifying the code.
*/

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

const getCategoryStyle = (category) => {
  const styles = {
    heritage: { color: "#8B4513", fillColor: "#D2691E", fillOpacity: 0.4 },
    parks: { color: "#228B22", fillColor: "#90EE90", fillOpacity: 0.4 },
    development: { color: "#4169E1", fillColor: "#87CEEB", fillOpacity: 0.4 },
  };

  return (
    styles[category] ?? {
      color: "#666",
      fillColor: "#ccc",
      fillOpacity: 0.4,
    }
  );
};

export default function DrawnAreas() {
  const map = useMap();
  const initializedRef = useRef(false);

  const [features, setFeatures] = useState(mockAreasData.features);

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

    map.on("pm:create", (e) => {
      const layer = e.layer;

      const geojson = layer.toGeoJSON();

      const newFeature = {
        ...geojson,
        properties: {
          id: `area-${Date.now()}`,
          title: "New Area",
          description: "Click to edit description",
          category: "default",
          createdAt: new Date().toISOString(),
        },
      };

      setFeatures((prev) => [...prev, newFeature]);

      layer.remove();
    });

    map.on("pm:edit", (e) => {
      e.layers.eachLayer((layer) => {
        const id = layer.feature?.properties?.id;
        if (!id) return;

        const updated = layer.toGeoJSON();

        //One edit could be to multiple features
        setFeatures((prev) =>
          prev.map((f) =>
            f.properties.id === id ? { ...f, geometry: updated.geometry } : f
          )
        );
      });
    });

    map.on("pm:remove", (e) => {
      const id = e.layer.feature?.properties?.id;
      if (!id) return;

      setFeatures((prev) => prev.filter((f) => f.properties.id !== id));
    });

    return () => {
      if (map.pm && initializedRef.current) {
        try {
          map.pm.removeControls();
        } catch (error) {
          console.error("DrawnAreas: Error removing controls", error);
        }
      }
      // map.pm.removeControls();
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
