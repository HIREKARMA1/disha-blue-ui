import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/auth/register") {
    const url = request.nextUrl.clone()
    url.pathname = "/signup"
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/auth/register"],
}
