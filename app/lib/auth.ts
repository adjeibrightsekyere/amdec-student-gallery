"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth.config";
import { signOut as nextAuthSignOut } from "next-auth/react";

export type UserRole = "visitor" | "admin";

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
}

/**
 * Get the current user session (server-side)
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id || "",
    username: session.user.username || "",
    role: (session.user.role as UserRole) || "visitor",
  };
}

/**
 * Sign out the current user
 */
export async function signOut() {
  await nextAuthSignOut({ redirect: true });
}
