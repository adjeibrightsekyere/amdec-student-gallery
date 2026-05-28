"use client";

import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { AuthUser, UserRole } from "@/app/lib/authHelpers";

/**
 * Hook for accessing current user in client components
 */
export function useCurrentUser() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return { user: null, loading: true };
  }

  if (!session?.user) {
    return { user: null, loading: false };
  }

  const user: AuthUser = {
    id: session.user.id || "",
    username: session.user.username || "",
    role: (session.user.role as UserRole) || "visitor",
  };

  return { user, loading: false };
}

/**
 * Sign out hook for client components
 */
export function useSignOut() {
  const router = useRouter();

  return async () => {
    await nextAuthSignOut({ redirect: false });
    router.replace("/");
  };
}
