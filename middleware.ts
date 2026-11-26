import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "./lib/constants";

// Signed-out visitors to the app go to sign-in. The real check (session
// signature, version, role) happens on the server in lib/auth.ts.
const PROTECTED_PREFIXES = ["/watchboard", "/workforce", "/shifts", "/supply", "/office", "/persona", "/elements", "/account", "/roadmap"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Calls from the Aultrum carer app carry a request id, logged and sent back.
  if (pathname.startsWith("/api/carer/")) {
    const requestId = request.headers.get("x-request-id")?.slice(0, 64) || crypto.randomUUID();
    console.log(JSON.stringify({ event: "aultrum_api", requestId, method: request.method, path: pathname }));
    const response = NextResponse.next();
    response.headers.set("x-request-id", requestId);
    return response;
  }

  if (PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`)) && !request.cookies.get(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/carer/:path*",
    "/watchboard/:path*",
    "/workforce/:path*",
    "/shifts/:path*",
    "/supply/:path*",
    "/office/:path*",
    "/persona/:path*",
    "/elements/:path*",
    "/account/:path*",
    "/roadmap/:path*",
  ],
};
