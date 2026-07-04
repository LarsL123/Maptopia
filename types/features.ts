import { Database } from "./supabase";

type DBFeature = Database["public"]["Tables"]["features"]["Row"];
type DBFeatureInsert = Database["public"]["Tables"]["features"]["Insert"];

// ── GeoJSON geometry types ────────────────────────────────────────────────────

export type GeoJSONGeometry =
  | { type: "Point"; coordinates: [number, number] }
  | { type: "LineString"; coordinates: [number, number][] }
  | { type: "Polygon"; coordinates: [number, number][][] }
  | { type: "MultiPoint"; coordinates: [number, number][] }
  | { type: "MultiLineString"; coordinates: [number, number][][] }
  | { type: "MultiPolygon"; coordinates: [number, number][][][] };

// ── Dynamic / extra properties stored in the JSONB column ────────────────────

export interface FeatureProperties {
  tags?: string[];
  difficulty?: "easy" | "medium" | "hard";
  elevationGain?: number;
  [key: string]: unknown;
}

// ── What the API returns to the frontend (standard GeoJSON Feature) ───────────

export interface DrawnFeature {
  id: DBFeature["id"];
  type: "Feature";
  geometry: GeoJSONGeometry;
  properties: {
    title: DBFeature["title"];
    description: DBFeature["description"];
    category: DBFeature["category"];
    createdAt: DBFeature["created_at"];
  } & FeatureProperties;
}

// ── POST body ─────────────────────────────────────────────────────────────────

export interface CreateFeatureBody {
  title: DBFeatureInsert["title"];
  description?: DBFeatureInsert["description"];
  category: DBFeatureInsert["category"];
  geometry: GeoJSONGeometry;
  properties?: FeatureProperties;
}

// ── PATCH body ────────────────────────────────────────────────────────────────

export interface UpdateFeatureBody {
  title?: string;
  description?: string;
  category?: string;
}
