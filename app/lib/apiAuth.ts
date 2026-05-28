import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth.config";
import { NextResponse } from "next/server";
import type { UserRole } from "@/app/lib/authHelpers";

export async function requireAuth(requiredRole?: UserRole) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  if (requiredRole && session.user.role !== requiredRole) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: {
      id: session.user.id,
      username: session.user.username,
      role: session.user.role as UserRole,
    },
  };
}
