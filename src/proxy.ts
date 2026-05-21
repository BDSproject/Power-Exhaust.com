import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// i18n middleware
const intlMiddleware = createMiddleware(routing);

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip i18n for API routes
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Auth redirects — utilise JWT uniquement (compatible Edge Runtime, pas de Prisma/pg)
  const isAuthPage = /\/login$/.test(pathname);
  const isDashboard = /\/(dashboard|rachats|attestations)/.test(pathname);
  const isAdmin = /\/admin/.test(pathname);

  if (isAuthPage || isDashboard || isAdmin) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET });

    if (token && isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (!token && isDashboard) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (!token && isAdmin) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (isAdmin && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Skip i18n for back-office / auth routes (suivi & identite sont des pages publiques i18n, pas listées ici)
  const isBackOffice = /^\/(dashboard|admin|rachats|attestations|login)(\/|$)/.test(pathname);
  if (isBackOffice) {
    return NextResponse.next();
  }

  // Apply i18n middleware for all public routes
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
