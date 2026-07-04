import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { UpdateFeatureBody } from "@/types/features";

type RouteContext = { params: Promise<{ id: string }> };

// ── PATCH /api/features/[id] ──────────────────────────────────────────────────

export async function PATCH(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body: UpdateFeatureBody = await req.json();
    const { title, description, category } = body;

    const patch: UpdateFeatureBody = {};
    if (title !== undefined) patch.title = title;
    if (description !== undefined) patch.description = description;
    if (category !== undefined) patch.category = category;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("features")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Feature not found" }, { status: 404 });

    return NextResponse.json(data);
  } catch (err) {
    console.error("PATCH /api/features/[id] error:", err);
    return NextResponse.json({ error: "Failed to update feature" }, { status: 500 });
  }
}

// ── DELETE /api/features/[id] ─────────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  try {
    const { id } = await params;

    const { error } = await supabase.from("features").delete().eq("id", id);

    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/features/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete feature" }, { status: 500 });
  }
}
