import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;
  const userCookie = request.cookies.get("user")?.value;

  const isAdminRoute = pathname.startsWith("/admin");
  const isSupervisorRoute = pathname.startsWith("/supervisor");
  const isClientRoute = pathname.startsWith("/client");
  const isProtectedRoute = isAdminRoute || isSupervisorRoute || isClientRoute;

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (userCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie));
      const role: string = user.role;

      if (isAdminRoute && role !== "admin") {
        return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
      }
      if (isSupervisorRoute && role !== "supervisor") {
        return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
      }
      if (isClientRoute && role !== "client") {
        return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
      }
    } catch {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");
      response.cookies.delete("user");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/supervisor/:path*", "/client/:path*"],
};
