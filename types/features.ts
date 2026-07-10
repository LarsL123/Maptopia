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

// Dynamic / extra properties stored in the JSONB column.
// Each entry is a typed, tagged object so new kinds (e.g. "link") can be
// added later without a migration — just extend the DynamicProperty union.
export interface TagProperty {
  type: "tag";
  name: string;
  score: number; // 1-10
}

export interface LinkProperty {
  type: "link";
  name: string;
  url: string;
}

export type DynamicProperty = TagProperty | LinkProperty;
export type DynamicProperties = DynamicProperty[];

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
