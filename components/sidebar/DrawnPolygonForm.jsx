"use client";

import React from "react";
import { useDrawnFeatures } from "../drawing/DrawnFeaturesProvider";

export default function DrawnPolygonForm({ selectedFeature, setMode }) {
  const { setFeatures } = useDrawnFeatures();
  const [formData, setFormData] = React.useState({
    title: selectedFeature?.properties?.title || "",
    description: selectedFeature?.properties?.description || "",
    category: selectedFeature?.properties?.category || "default",
  });
  const [isSaving, setIsSaving] = React.useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!selectedFeature) return;

    setIsSaving(true);

    const updatedFeature = {
      ...selectedFeature,
      properties: {
        ...selectedFeature.properties,
        ...formData,
      },
    };

    // Update local state
    setFeatures((prev) =>
      prev.map((f) =>
        f.properties.id === selectedFeature.properties.id ? updatedFeature : f
      )
    );

    // Update backend
    try {
      await fetch(`/api/features/${selectedFeature.properties.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
        }),
      });
      setMode("draw");
    } catch (err) {
      console.error("Failed to update feature:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFeature) return;
    if (!confirm("Are you sure you want to delete this area?")) return;

    setIsSaving(true);

    // Update local state
    setFeatures((prev) =>
      prev.filter((f) => f.properties.id !== selectedFeature.properties.id)
    );

    // Delete from backend
    try {
      await fetch(`/api/features/${selectedFeature.properties.id}`, {
        method: "DELETE",
      });
      setMode("draw");
    } catch (err) {
      console.error("Failed to delete feature:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedFeature) {
    return (
      <div className="text-sm text-gray-500">No feature selected</div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMode("draw")}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back to list
        </button>
      </div>

      <h3 className="text-sm font-semibold text-gray-800">Edit Area</h3>

      {/* Form Fields */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-2 py-1 text-sm bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-2 py-1 text-sm bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-2 py-1 text-sm bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="default">Default</option>
            <option value="heritage">Heritage</option>
            <option value="parks">Parks</option>
            <option value="development">Development</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={handleDelete}
          disabled={isSaving}
          className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Delete
        </button>
      </div>

      {/* Feature Info */}
      <div className="pt-3 border-t border-gray-300">
        <p className="text-xs text-gray-500">
          ID: {selectedFeature.properties.id}
        </p>
        <p className="text-xs text-gray-500">
          Created: {new Date(selectedFeature.properties.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
