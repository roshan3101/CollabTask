import { NextRequest, NextResponse } from "next/server"

const publicRoutes = ["/login", "/signup", "/forgot-password"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  const accessToken = request.cookies.get("accessToken")?.value

  if (!isPublicRoute && !accessToken) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
