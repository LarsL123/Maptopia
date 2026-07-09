"use client";

import { type ComponentType, type ComponentProps } from "react";
import { Polygon, Popup } from "react-leaflet";

import getCategoryStyle from "./DrawnAreaCategory";
import { useDrawnFeatures } from "./DrawnFeaturesProvider";
import { useLayerEditSync } from "./DrawingController";

// Polygon extended with pmIgnore prop from leaflet-geoman
const PmPolygon = Polygon as ComponentType<
  ComponentProps<typeof Polygon> & { pmIgnore?: boolean }
>;

interface DrawnAreasRendererProps {
  // Whether polygons should be wired up for Leaflet.pm editing.
  editable?: boolean;
}

export default function DrawnAreasRenderer({
  editable = false,
}: DrawnAreasRendererProps) {
  const { features, setFeatures } = useDrawnFeatures();
  const { addEditListener, removeEditListener } = useLayerEditSync(setFeatures);

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
          pmIgnore={!editable}
          eventHandlers={
            editable
              ? {
                  add: addEditListener(feature),
                  remove: removeEditListener,
                }
              : undefined
          }
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
}
