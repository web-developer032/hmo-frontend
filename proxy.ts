import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "hmo_authenticated";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/landlord",
  "/admin",
  "/tenant",
  "/messages",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/** Next.js 16+: `middleware` file convention was renamed to `proxy`. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = request.cookies.get(AUTH_COOKIE)?.value === "1";

  if (isProtectedPath(pathname)) {
    if (!authed) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname === "/login" || pathname === "/register") {
    if (authed) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/landlord/:path*",
    "/admin/:path*",
    "/tenant/:path*",
    "/messages/:path*",
    "/login",
    "/register",
  ],
};
