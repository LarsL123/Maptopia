import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { CreateFeatureBody, DrawnFeature } from "@/types/features";
import type { Json } from "@/types/supabase";

// ── Helpers ───────────────────────────────────────────────────────────────────

function toGeoJSON(row: Record<string, unknown>): DrawnFeature {
  return {
    id: row.id as string,
    type: "Feature",
    // PostGIS returns geometry as GeoJSON when using ST_AsGeoJSON, or as a
    // parsed object when using the `geojson` helper in the RPC below.
    geometry: row.geometry as DrawnFeature["geometry"],
    properties: {
      title: row.title as string,
      description: row.description as string | null,
      category: row.category as string,
      createdAt: row.created_at as string,
      ...(row.properties as object),
    },
  };
}

// ── GET /api/features ─────────────────────────────────────────────────────────
//
// Query params:
//   bbox=west,south,east,north  — return features intersecting the bounding box
//   category=trail              — filter by category (combinable with bbox)
//
// Requires this SQL function in Supabase (run once):
//
// create or replace function features_in_bbox(
//   west  float, south float, east float, north float,
//   filter_category text default null
// )
// returns table (
//   id text, title text, description text, category text,
//   created_at text, geometry json, properties jsonb
// ) language sql as $$
//   select
//     id::text, title, description, category, created_at::text,
//     ST_AsGeoJSON(geometry)::json as geometry,
//     properties
//   from public.features
//   where ST_Intersects(geometry, ST_MakeEnvelope(west, south, east, north, 4326))
//     and (filter_category is null or category = filter_category);
// $$;

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  const bboxParam = searchParams.get("bbox");
  const category = searchParams.get("category");

  try {
    if (bboxParam) {
      const parts = bboxParam.split(",").map(Number);
      if (parts.length !== 4 || parts.some(isNaN)) {
        return NextResponse.json(
          {
            error:
              "bbox must be four comma-separated numbers: west,south,east,north",
          },
          { status: 400 },
        );
      }
      const [west, south, east, north] = parts;

      const { data, error } = await supabase.rpc("features_in_bbox", {
        west,
        south,
        east,
        north,
        filter_category: category ?? null,
      });

      if (error) throw error;
      return NextResponse.json((data ?? []).map(toGeoJSON));
    }

    // No bbox — return all features (with optional category filter).
    // For production, consider adding a limit or requiring a bbox.
    let query = supabase
      .from("features")
      .select("id, title, description, category, created_at, properties");

    if (category) query = query.eq("category", category);

    const { data, error } = await query;
    if (error) throw error;

    // Without an RPC, geometry comes back as the raw PostGIS binary — we can't
    // convert it here. Use the RPC (bbox) path for full GeoJSON output.
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("GET /api/features error:", err);
    return NextResponse.json(
      { error: "Failed to fetch features" },
      { status: 500 },
    );
  }
}

// ── POST /api/features ────────────────────────────────────────────────────────

// Body (JSON):
//   { title, description?, category, geometry: GeoJSON, properties?: {} }

// Geometry is stored via ST_GeomFromGeoJSON so the client sends plain GeoJSON.
// This requires a second SQL helper (run once):

// create or replace function insert_feature(
//   p_title       text,
//   p_description text,
//   p_category    text,
//   p_geometry    json,
//   p_properties  jsonb default '{}'
// )
// returns features language sql as $$
//   insert into public.features (title, description, category, geometry, properties)
//   values (
//     p_title, p_description, p_category,
//     ST_SetSRID(ST_GeomFromGeoJSON(p_geometry::text), 4326),
//     p_properties
//   )
//   returning *;
// $$;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: CreateFeatureBody = await req.json();
    const { title, description, category, geometry, properties } = body;

    if (!title || !category || !geometry) {
      return NextResponse.json(
        { error: "title, category and geometry are required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase.rpc("insert_feature", {
      p_title: title,
      p_description: description ?? null,
      p_category: category,
      p_geometry: geometry as Json,
      p_properties: (properties ?? {}) as Json,
    });

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("POST /api/features error:", err);
    return NextResponse.json(
      { error: "Failed to create feature" },
      { status: 500 },
    );
  }
}
