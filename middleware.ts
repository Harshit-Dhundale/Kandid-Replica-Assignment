// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that require auth
const PROTECTED = ["/dashboard", "/leads", "/campaigns"];

// Candidate cookie names Better Auth may set.
// After your first login, open DevTools → Application → Cookies
// and update this list to the exact cookie name if needed.
const SESSION_COOKIE_CANDIDATES = [
  "better-auth.session-token",
  "better-auth.session_token",
  "auth_session",
  "ba_session",
];

function hasSessionCookie(req: NextRequest) {
  const raw = req.headers.get("cookie") ?? "";
  if (!raw) return false;
  const parts = raw.split(";");
  return SESSION_COOKIE_CANDIDATES.some((name) =>
    parts.some((p) => p.trim().startsWith(`${name}=`)),
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static assets & auth/api routes in matcher below.
  const needsAuth = PROTECTED.some((p) => pathname.startsWith(p));

  // Guard protected pages
  if (needsAuth && !hasSessionCookie(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (pathname === "/login" || pathname === "/register") {
    if (hasSessionCookie(req)) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Exclude API (including OAuth callbacks), Next assets, and favicon
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
