import { NextResponse, type NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

const PROTECTED_PREFIXES = ["/inbox", "/all", "/archived"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = getSessionCookie(request)

  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  if (pathname === "/sign-in" && sessionCookie) {
    return NextResponse.redirect(new URL("/inbox", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/inbox/:path*", "/all/:path*", "/archived/:path*", "/sign-in"],
}
