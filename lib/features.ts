import { supabase } from "./supabase";
import { Database } from "../types/supabase";

import type {
  DrawnFeature,
  DynamicProperties,
  GeoJSONGeometry,
} from "../types/features";
import type { Json } from "../types/supabase";

interface FeatureRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  created_at: string;
  geometry: unknown;
  properties: Json;
}

type DBFeatureInsert = Database["public"]["Tables"]["features"]["Insert"];

export interface CreateFeatureBody {
  title: DBFeatureInsert["title"];
  description?: DBFeatureInsert["description"];
  category: DBFeatureInsert["category"];
  geometry: GeoJSONGeometry;
  dynamicProperties?: DynamicProperties;
}

export interface UpdateFeatureBody {
  title?: string;
  description?: string;
  category?: string;
  dynamicProperties?: DynamicProperties;
}

function rowToFeature(row: FeatureRow): DrawnFeature {
  return {
    id: row.id,
    type: "Feature",
    geometry: row.geometry as GeoJSONGeometry,
    properties: {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      createdAt: row.created_at,
      // Legacy rows may still have `{}` from before dynamicProperties was an
      // array of typed entries — tolerate that instead of crashing consumers.
      dynamicProperties: Array.isArray(row.properties)
        ? (row.properties as unknown as DynamicProperties)
        : [],
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
    p_properties: (input.dynamicProperties ?? []) as unknown as Json,
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
  const { dynamicProperties, ...columns } = patch;

  const { data, error } = await supabase
    .from("features")
    .update({
      ...columns,
      // Omit the column entirely when dynamicProperties isn't given, so the
      // existing JSONB value is left untouched rather than cleared.
      ...(dynamicProperties !== undefined && {
        properties: dynamicProperties as unknown as Json,
      }),
    })
    .eq("id", id)
    .select("id");

  if (error) throw error;
  //Zero rows returned means nothing was done, but wont throw error.
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
