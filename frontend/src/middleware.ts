import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Public routes that don't require authentication
 */
const publicRoutes = [
  "/login",
  "/signup",
  "/reset-password",
  "/api", // API routes are handled by the backend
  "/_next", // Next.js internal routes
  "/favicon.ico",
  "/images", // Static images
];

/**
 * Check if a path is a public route
 */
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Check if a path is an auth route (login/signup)
 */
function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith("/login") || pathname.startsWith("/signup");
}

/**
 * Next.js Middleware for authentication
 * 
 * Note: Since the API is stateless (uses X-Session-ID and X-Pk-User headers),
 * we cannot check authentication in the Edge Runtime middleware (it can't access localStorage).
 * Authentication is checked client-side in the layout components.
 * 
 * This middleware only handles basic route protection and allows all routes to pass through.
 * The actual authentication check happens in client components using the Zustand store.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Allow all other routes to pass through
  // Authentication will be checked client-side in layout components
  return NextResponse.next();
}

/**
 * Middleware configuration
 * 
 * Matches all routes except:
 * - API routes (handled by Symfony backend)
 * - Next.js internal routes (_next, static files)
 * - Static files (images, favicon, etc.)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};

