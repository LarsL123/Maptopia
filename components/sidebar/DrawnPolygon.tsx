"use client";

import FolderItem from "./FolderItem";
import { useDrawnFeatures } from "../drawing/DrawnFeaturesProvider";
import type { DrawnFeature } from "../../types/features";
import type { SidebarMode } from "./Sidebar";

interface DrawnPolygonProps {
  setMode: (mode: SidebarMode) => void;
  setSelectedFeature: (feature: DrawnFeature | null) => void;
}

interface DrawnAreaItemProps {
  feature: DrawnFeature;
  setMode: (mode: SidebarMode) => void;
  setSelectedFeature: (feature: DrawnFeature | null) => void;
}

function groupByCategory(
  features: DrawnFeature[],
): { label: string; features: DrawnFeature[] }[] {
  const groups = new Map<string, { label: string; features: DrawnFeature[] }>();

  for (const feature of features) {
    const category = feature.properties.category || "default";
    const key = category.toLowerCase();
    const group = groups.get(key);
    if (group) {
      group.features.push(feature);
    } else {
      groups.set(key, { label: category, features: [feature] });
    }
  }

  return Array.from(groups.values()).sort((a, b) =>
    a.label.localeCompare(b.label),
  );
}

export default function DrawnPolygon({
  setMode,
  setSelectedFeature,
}: DrawnPolygonProps) {
  const { features } = useDrawnFeatures() as { features: DrawnFeature[] };
  const groups = groupByCategory(features);

  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold mb-2 text-gray-800">Drawn Areas</h3>

      {features.length === 0 ? (
        <div className="px-2 py-1 text-xs text-gray-500 italic">
          No drawings yet
        </div>
      ) : (
        groups.map((group) => (
          <FolderItem
            key={group.label}
            label={`${group.label.charAt(0).toUpperCase() + group.label.slice(1)} (${group.features.length})`}
            defaultOpen
          >
            {group.features.map((feature) => (
              <DrawnAreaItem
                key={feature.properties.id}
                feature={feature}
                setMode={setMode}
                setSelectedFeature={setSelectedFeature}
              />
            ))}
          </FolderItem>
        ))
      )}
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
