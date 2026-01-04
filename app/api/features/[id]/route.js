import clientPromise from "@/lib/mongodb";

async function getDB() {
  const client = await clientPromise;
  return client.db("mapdb");
}

export async function PATCH(req, { params }) {
  try {
    console.log("PATCH /api/features/[id] called");
    const db = await getDB();
    const update = await req.json();

    const resolvedParams = await params;

    // Update fields within the properties object to avoid duplicates at root level
    const updateFields = {};
    if (update.title !== undefined) updateFields["properties.title"] = update.title;
    if (update.description !== undefined) updateFields["properties.description"] = update.description;
    if (update.category !== undefined) updateFields["properties.category"] = update.category;

    await db
      .collection("features")
      .updateOne({ "properties.id": resolvedParams.id }, { $set: updateFields });

    return new Response(JSON.stringify({ id: resolvedParams.id, ...update }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PATCH /api/features/[id] error:", error);
    return new Response(JSON.stringify({ error: "Failed to update feature" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(req, { params }) {
  try {
    const db = await getDB();
    const resolvedParams = await params;

    await db
      .collection("features")
      .deleteOne({ "properties.id": resolvedParams.id });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/features/[id] error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete feature" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
