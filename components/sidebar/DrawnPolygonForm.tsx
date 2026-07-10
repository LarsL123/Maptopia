"use client";

import React from "react";
import { useDrawnFeatures } from "../drawing/DrawnFeaturesProvider";
import { useAuth } from "../auth/AuthProvider";
import { updateFeature, deleteFeature } from "../../lib/features";
import type { DrawnFeature, DynamicProperty, TagProperty } from "../../types/features";
import type { SidebarMode } from "./Sidebar";

interface DrawnPolygonFormProps {
  selectedFeature: DrawnFeature | null;
  setMode: (mode: SidebarMode) => void;
}

interface FormData {
  title: string;
  description: string;
  category: string;
}

const BASELINE_CATEGORIES = ["default", "heritage", "parks", "development"];
const NEW_CATEGORY_VALUE = "__new__";

export default function DrawnPolygonForm({
  selectedFeature,
  setMode,
}: DrawnPolygonFormProps) {
  const { features, setFeatures } = useDrawnFeatures() as {
    features: DrawnFeature[];
    setFeatures: React.Dispatch<React.SetStateAction<DrawnFeature[]>>;
  };
  const { session } = useAuth();
  const [formData, setFormData] = React.useState<FormData>({
    title: selectedFeature?.properties?.title || "",
    description: selectedFeature?.properties?.description || "",
    category: selectedFeature?.properties?.category || "default",
  });
  const [isCreatingCategory, setIsCreatingCategory] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [dynamicProperties, setDynamicProperties] = React.useState<
    DynamicProperty[]
  >(selectedFeature?.properties?.dynamicProperties ?? []);
  const [newTagName, setNewTagName] = React.useState("");
  const [newTagScore, setNewTagScore] = React.useState(5);
  const [isSaving, setIsSaving] = React.useState(false);

  // Existing categories (baseline + anything already used) so a category can
  // be picked from a dropdown instead of retyped.
  const categoryOptions = React.useMemo(() => {
    const seen = new Map<string, string>();
    for (const c of BASELINE_CATEGORIES) seen.set(c.toLowerCase(), c);
    for (const f of features) {
      const c = f.properties.category;
      if (c && !seen.has(c.toLowerCase())) seen.set(c.toLowerCase(), c);
    }
    return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
  }, [features]);

  // Tag names already used elsewhere, offered as autocomplete suggestions.
  const tagNameSuggestions = React.useMemo(() => {
    const names = new Set<string>();
    for (const f of features) {
      for (const p of f.properties.dynamicProperties) {
        if (p.type === "tag") names.add(p.name);
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [features]);

  const tagEntries = dynamicProperties.filter(
    (p): p is TagProperty => p.type === "tag",
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === NEW_CATEGORY_VALUE) {
      setIsCreatingCategory(true);
    } else {
      setIsCreatingCategory(false);
      setFormData((prev) => ({ ...prev, category: value }));
    }
  };

  const handleAddTag = () => {
    const name = newTagName.trim();
    if (!name) return;

    setDynamicProperties((prev) => {
      const entry: TagProperty = { type: "tag", name, score: newTagScore };
      const idx = prev.findIndex(
        (p) => p.type === "tag" && p.name.toLowerCase() === name.toLowerCase(),
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = entry;
        return next;
      }
      return [...prev, entry];
    });
    setNewTagName("");
    setNewTagScore(5);
  };

  const handleRemoveTag = (name: string) => {
    setDynamicProperties((prev) =>
      prev.filter((p) => !(p.type === "tag" && p.name === name)),
    );
  };

  const handleSave = async () => {
    if (!selectedFeature) return;

    const category = isCreatingCategory
      ? newCategoryName.trim()
      : formData.category;
    if (!category) {
      alert("Please enter a name for the new category.");
      return;
    }

    setIsSaving(true);

    const updatedFeature: DrawnFeature = {
      ...selectedFeature,
      properties: {
        ...selectedFeature.properties,
        ...formData,
        category,
        dynamicProperties,
      },
    };

    try {
      await updateFeature(selectedFeature.properties.id, {
        title: formData.title,
        description: formData.description,
        category,
        dynamicProperties,
      });
      setFeatures((prev) =>
        prev.map((f) =>
          f.properties.id === selectedFeature.properties.id
            ? updatedFeature
            : f,
        ),
      );
      setMode("draw");
    } catch (err) {
      console.error("Failed to update feature:", err);
      alert("Failed to save. Are you signed in as the owner of this area?");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFeature) return;
    if (!confirm("Are you sure you want to delete this area?")) return;

    setIsSaving(true);

    try {
      await deleteFeature(selectedFeature.properties.id);
      setFeatures((prev) =>
        prev.filter((f) => f.properties.id !== selectedFeature.properties.id),
      );
      setMode("draw");
    } catch (err) {
      console.error("Failed to delete feature:", err);
      alert("Failed to delete. Are you signed in as the owner of this area?");
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedFeature) {
    return <div className="text-sm text-gray-500">No feature selected</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMode("draw")}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back to list
        </button>
      </div>

      <h3 className="text-sm font-semibold text-gray-800">Edit Area</h3>

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
            value={isCreatingCategory ? NEW_CATEGORY_VALUE : formData.category}
            onChange={handleCategoryChange}
            className="w-full px-2 py-1 text-sm bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
            <option value={NEW_CATEGORY_VALUE}>+ Create new category…</option>
          </select>
          {isCreatingCategory && (
            <input
              type="text"
              autoFocus
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="mt-2 w-full px-2 py-1 text-sm bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Tags
          </label>

          {tagEntries.length > 0 && (
            <ul className="mb-2 space-y-1">
              {tagEntries.map((tag) => (
                <li
                  key={tag.name}
                  className="flex items-center justify-between gap-2 px-2 py-1 text-sm bg-gray-100 rounded"
                >
                  <span className="text-gray-700">
                    {tag.name} · {tag.score}/10
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag.name)}
                    className="text-xs text-gray-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-2">
            <input
              type="text"
              list="tag-name-suggestions"
              placeholder="e.g. runnability"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="w-full px-2 py-1 text-sm bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={10}
                value={newTagScore}
                onChange={(e) => setNewTagScore(Number(e.target.value))}
                className="min-w-0 flex-1"
              />
              <span className="w-6 text-xs text-gray-600 text-right">
                {newTagScore}
              </span>
              <button
                type="button"
                onClick={handleAddTag}
                className="px-2 py-1 text-xs font-medium text-white bg-gray-600 rounded hover:bg-gray-700"
              >
                Add
              </button>
            </div>
          </div>
          <datalist id="tag-name-suggestions">
            {tagNameSuggestions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
      </div>

      {!session && (
        <p className="text-xs text-amber-600">
          Sign in to edit or delete areas.
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving || !session}
          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={handleDelete}
          disabled={isSaving || !session}
          className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Delete
        </button>
      </div>

      <div className="pt-3 border-t border-gray-300">
        <p className="text-xs text-gray-500">
          ID: {selectedFeature.properties.id}
        </p>
        <p className="text-xs text-gray-500">
          Created:{" "}
          {new Date(selectedFeature.properties.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
