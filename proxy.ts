import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Redirect /seller-dashboard root to /seller-dashboard/home
  if (pathname === "/seller-dashboard" || pathname === "/seller-dashboard/") {
    return NextResponse.redirect(new URL("/seller-dashboard/home", request.url));
  }

  // Check for Better Auth session cookie on protected routes
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const loginUrl = new URL("/auth/login", request.url);
    const callbackURL = `${pathname}${search}`;
    loginUrl.searchParams.set("callbackURL", callbackURL);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/seller-dashboard/:path*",
    "/seller-dashboard",
    "/listings/:path*",
    "/cart/:path*",
  ],
};
