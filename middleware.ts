import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

export const middleware = withAuth(
  function middleware(request: NextRequest) {
    // The token is injected by withAuth if authorized
    const token = (request as any).nextauth?.token;
    const pathname = request.nextUrl.pathname;

    // Admin routes protection
    if (pathname.startsWith("/admin")) {
      if (!token || token.role !== "admin") {
        return new Response("Unauthorized", { status: 401 });
      }
    }

    // Visitor routes protection
    if (pathname.startsWith("/visitor")) {
      if (!token) {
        return new Response("Unauthorized", { status: 401 });
      }
    }

    // Upload routes protection
    if (pathname.startsWith("/upload")) {
      if (!token || token.role !== "admin") {
        return new Response("Unauthorized", { status: 401 });
      }
    }

    // Class routes protection
    if (pathname.startsWith("/class")) {
      if (!token) {
        return new Response("Unauthorized", { status: 401 });
      }
    }

    return undefined;
  },
  {
    callbacks: {
      authorized({ token }) {
        // Allow public routes and auth routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/visitor/:path*", "/upload/:path*", "/class/:path*"],
};
