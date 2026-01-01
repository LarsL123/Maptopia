import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("mapdb");
    const features = await db.collection("features").find({}).toArray();
    return new Response(JSON.stringify(features), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("GET /api/features error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch features" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("mapdb");
    const newFeature = await req.json();
    await db.collection("features").insertOne(newFeature);
    return new Response(JSON.stringify(newFeature), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("POST /api/features error:", error);
    return new Response(JSON.stringify({ error: "Failed to create feature" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
