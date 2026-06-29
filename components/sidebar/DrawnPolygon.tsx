"use client";

import FolderItem from "./FolderItem";
import { useDrawnFeatures } from "../drawing/DrawnFeaturesProvider";
import type { DrawnFeature, SidebarMode } from "../types";

interface DrawnPolygonProps {
  setMode: (mode: SidebarMode) => void;
  setSelectedFeature: (feature: DrawnFeature | null) => void;
}

interface DrawnAreaItemProps {
  feature: DrawnFeature;
  setMode: (mode: SidebarMode) => void;
  setSelectedFeature: (feature: DrawnFeature | null) => void;
}

export default function DrawnPolygon({
  setMode,
  setSelectedFeature,
}: DrawnPolygonProps) {
  const { features } = useDrawnFeatures() as { features: DrawnFeature[] };

  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold mb-2 text-gray-800">Drawn Areas</h3>

      <FolderItem label={`My Drawings (${features.length})`} defaultOpen>
        {features.length === 0 ? (
          <div className="px-2 py-1 text-xs text-gray-500 italic">
            No drawings yet
          </div>
        ) : (
          features.map((feature) => (
            <DrawnAreaItem
              key={feature.properties.id}
              feature={feature}
              setMode={setMode}
              setSelectedFeature={setSelectedFeature}
            />
          ))
        )}
      </FolderItem>
    </div>
  );
}

function DrawnAreaItem({
  feature,
  setMode,
  setSelectedFeature,
}: DrawnAreaItemProps) {
  const handleClick = () => {
    setSelectedFeature(feature);
    setMode("draw-info");
  };

  return (
    <div className="group flex items-center justify-between gap-2 px-2 py-1 hover:bg-gray-200 rounded cursor-pointer">
      <span className="text-sm text-gray-600">{feature.properties.title}</span>
      <span
        onClick={handleClick}
        className="text-xs text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        edit
      </span>
    </div>
  );
}
