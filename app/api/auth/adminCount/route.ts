import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const count = await db.collection("users").countDocuments({ role: "admin" });
    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error("adminCount error:", error);
    return NextResponse.json({ error: "Unable to fetch admin count" }, { status: 500 });
  }
}
