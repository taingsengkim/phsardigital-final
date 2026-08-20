<<<<<<< HEAD
// export { auth as middleware } from "@/auth";

// export const config = {
//   matcher: ["/listings/:path*", "/cart/:path*"], // add protected routes
// };
=======
﻿import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackURL", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/listings/:path*", "/cart/:path*"],
};
>>>>>>> origin/main
