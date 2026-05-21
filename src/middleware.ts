import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// i18n middleware
const intlMiddleware = createMiddleware(routing);

// Auth check wrapper
export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Skip i18n for API routes
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Auth redirects
  const isAuthPage = /\/login$/.test(pathname);
  const isDashboard = /\/(dashboard|rachats|attestations)/.test(pathname);
  const isAdmin = /\/admin/.test(pathname);

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (!session && isDashboard) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (!session && isAdmin) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (isAdmin && session?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Skip i18n for back-office / auth routes
  const isBackOffice = /^\/(dashboard|admin|rachats|attestations|login|identite|suivi)(\/|$)/.test(pathname);
  if (isBackOffice) {
    return NextResponse.next();
  }

  // Apply i18n middleware for all public routes (including /en, /de/rachat, etc.)
  return intlMiddleware(req as NextRequest);
});

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
