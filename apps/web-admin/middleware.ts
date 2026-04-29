import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PELADAS_ACCESS_COOKIE } from "./lib/cookie-name";
import { verifyJwtHs256 } from "./lib/edge-jwt";
import { getJwtSecretKey } from "./lib/jwt-secret";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(PELADAS_ACCESS_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  const payload = await verifyJwtHs256(token, getJwtSecretKey());
  if (!payload || payload.isAdmin !== true) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico).*)"],
};
