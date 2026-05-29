import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import { hashPassword, UserRole } from "@/app/lib/authHelpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, role } = body;

    if (!username || !password || !role) {
      return NextResponse.json(
        { error: "Username, password, and role are required" },
        { status: 400 }
      );
    }

    if (!["visitor", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Enforce maximum number of admins
    if (role === "admin") {
      const MAX_ADMINS = 3;
      const adminCount = await db.collection("users").countDocuments({ role: "admin" });
      if (adminCount >= MAX_ADMINS) {
        return NextResponse.json(
          { error: "Admin registrations are closed" },
          { status: 403 }
        );
      }
    }

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({
      username: username.toLowerCase(),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);

    const result = await db.collection("users").insertOne({
      username: username.toLowerCase(),
      password: hashedPassword,
      role: role as UserRole,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: result.insertedId.toString(),
          username: username.toLowerCase(),
          role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
