import { supabase } from "./supabase";
import type {
  CreateFeatureBody,
  DrawnFeature,
  FeatureProperties,
  GeoJSONGeometry,
  UpdateFeatureBody,
} from "../types/features";
import type { Json } from "../types/supabase";

/*
  Direct Supabase access from the browser. Writes are protected by RLS
  (insert/update/delete require an authenticated user owning the row),
  reads are public.
*/

interface FeatureRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  created_at: string;
  geometry: unknown;
  properties: Json;
}

function rowToFeature(row: FeatureRow): DrawnFeature {
  return {
    id: row.id,
    type: "Feature",
    geometry: row.geometry as GeoJSONGeometry,
    properties: {
      // Spread the jsonb extras first so the canonical columns win.
      ...((row.properties ?? {}) as FeatureProperties),
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      createdAt: row.created_at,
    },
  };
}

// The features_in_bbox RPC returns geometry as GeoJSON; a plain select on the
// table would return the raw PostGIS binary, so always go through the RPC.
export async function fetchFeatures(
  category?: string,
): Promise<DrawnFeature[]> {
  const { data, error } = await supabase.rpc("features_in_bbox", {
    west: -180,
    south: -90,
    east: 180,
    north: 90,
    ...(category ? { filter_category: category } : {}),
  });

  if (error) throw error;
  return (data ?? []).map(rowToFeature);
}

export async function createFeature(
  input: CreateFeatureBody,
): Promise<DrawnFeature> {
  const { data, error } = await supabase.rpc("insert_feature", {
    p_title: input.title,
    p_description: input.description ?? "",
    p_category: input.category,
    p_geometry: input.geometry as unknown as Json,
    p_properties: (input.properties ?? {}) as Json,
  });

  if (error) throw error;
  // insert_feature returns geometry in the raw PostGIS format — reuse the
  // GeoJSON we just sent instead of converting it back.
  return rowToFeature({ ...data, geometry: input.geometry });
}

export async function updateFeature(
  id: string,
  patch: UpdateFeatureBody,
): Promise<void> {
  const { data, error } = await supabase
    .from("features")
    .update(patch)
    .eq("id", id)
    .select("id");

  if (error) throw error;
  // RLS filters out rows you don't own, so a blocked update reports success
  // with zero rows — surface that as an error.
  if (!data || data.length === 0)
    throw new Error("Update was rejected — you may not own this feature.");
}

export async function updateFeatureGeometry(
  id: string,
  geometry: GeoJSONGeometry,
): Promise<void> {
  const { error } = await supabase.rpc(
    // Cast needed until types/supabase.ts is regenerated after the migration
    // that creates this RPC (npx supabase gen types typescript --linked).
    "update_feature_geometry" as "insert_feature",
    { p_id: id, p_geometry: geometry as unknown as Json } as never,
  );

  if (error) throw error;
}

export async function deleteFeature(id: string): Promise<void> {
  const { data, error } = await supabase
    .from("features")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throw error;
  if (!data || data.length === 0)
    throw new Error("Delete was rejected — you may not own this feature.");
}
