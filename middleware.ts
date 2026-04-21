import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname === "/auth/register" &&
    request.nextUrl.searchParams.get("type") !== "corporate"
  ) {
    return NextResponse.redirect(new URL("/signup/step-1", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/auth/register"],
}
