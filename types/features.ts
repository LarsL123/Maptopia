import { Database } from "./supabase";

type DBFeature = Database["public"]["Tables"]["features"]["Row"];

// ── GeoJSON geometry types ────────────────────────────────────────────────────

export type GeoJSONGeometry =
  | { type: "Point"; coordinates: [number, number] }
  | { type: "LineString"; coordinates: [number, number][] }
  | { type: "Polygon"; coordinates: [number, number][][] }
  | { type: "MultiPoint"; coordinates: [number, number][] }
  | { type: "MultiLineString"; coordinates: [number, number][][] }
  | { type: "MultiPolygon"; coordinates: [number, number][][][] };

// Dynamic / extra properties stored in the JSONB column
// Schemaless — keys and shapes vary per feature and are read dynamically.
export type DynamicProperties = Record<string, unknown>;

//This is structured in this way to saty compliant with the GeoJSON standard.
export interface DrawnFeature {
  id: DBFeature["id"];
  type: "Feature";
  geometry: GeoJSONGeometry;
  properties: {
    // Duplicated from the top-level id because the map/sidebar components key
    // off feature.properties.id. //TODO Change
    id: DBFeature["id"];
    title: DBFeature["title"];
    description: DBFeature["description"];
    category: DBFeature["category"];
    createdAt: DBFeature["created_at"];
    dynamicProperties: DynamicProperties;
  };
}
