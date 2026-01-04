"use client";

import React from "react";
import DrawnPolygon from "./DrawnPolygon";
import DrawnPolygonForm from "./DrawnPolygonForm";
import FolderItem from "./FolderItem";
import FileItem from "./FileItem";

export default function Sidebar() {
  const [mode, setMode] = React.useState("layers");
  const [selectedFeature, setSelectedFeature] = React.useState(null);

  return (
    <div className="w-64 bg-gray-100 border-l border-gray-300 overflow-y-auto flex flex-col">
      {/* Mode Switcher Icons */}
      <div className="flex border-b border-gray-300 bg-gray-200">
        <ModeIcon
          icon="🗺️"
          label="Layers"
          isActive={mode === "layers"}
          onClick={() => setMode("layers")}
        />
        <ModeIcon
          icon="📊"
          label="Data"
          isActive={mode === "data"}
          onClick={() => setMode("data")}
        />
        <ModeIcon
          icon="✏️"
          label="Draw"
          isActive={mode === "draw"}
          onClick={() => setMode("draw")}
        />
        <ModeIcon
          icon="⚙️"
          label="Draw Info"
          isActive={mode === "draw-info"}
          onClick={() => setMode("draw-info")}
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {mode === "layers" && <LayersContent />}
        {mode === "data" && <DataContent />}
        {mode === "draw" && (
          <DrawnPolygon
            setMode={setMode}
            setSelectedFeature={setSelectedFeature}
          />
        )}
        {mode === "draw-info" && (
          <DrawnPolygonForm
            selectedFeature={selectedFeature}
            setMode={setMode}
          />
        )}
      </div>
    </div>
  );
}

// Mode Icon Component
function ModeIcon({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-colors ${
        isActive
          ? "bg-gray-100 border-b-2 border-blue-500"
          : "hover:bg-gray-300"
      }`}
      title={label}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs mt-1 text-gray-700">{label}</span>
    </button>
  );
}

// Content Components for different modes
function LayersContent() {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold mb-2 text-gray-800">Map Layers</h3>
      <FolderItem label="Base Layers" defaultOpen>
        <FileItem label="WMS Layer" />
        <FileItem label="Kart Overlay" />
      </FolderItem>
      <FolderItem label="Markers">
        <FileItem label="Doma Markers" />
        <FileItem label="Custom Markers" />
      </FolderItem>
    </div>
  );
}

function DataContent() {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold mb-2 text-gray-800">Data Sources</h3>
      <FolderItem label="Datasets" defaultOpen>
        <FileItem label="Population Data" />
        <FileItem label="Land Use" />
        <FileItem label="Elevation" />
      </FolderItem>
      <FolderItem label="Analytics">
        <FileItem label="Statistics" />
        <FileItem label="Reports" />
      </FolderItem>
    </div>
  );
}
