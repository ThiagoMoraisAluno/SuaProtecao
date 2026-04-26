import { NextResponse, type NextRequest } from "next/server";

// Mapeamento rota → role exigida. Adicionar novas roles aqui sem tocar no restante.
const ROLE_PREFIXES: Record<string, string> = {
  "/admin": "admin",
  "/supervisor": "supervisor",
  "/client": "client",
};

function redirectToLogin(request: NextRequest, clearCookies = false): NextResponse {
  const response = NextResponse.redirect(new URL("/login", request.url));
  if (clearCookies) {
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    response.cookies.delete("user");
  }
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const matchedPrefix = Object.keys(ROLE_PREFIXES).find((p) =>
    pathname.startsWith(p)
  );

  if (!matchedPrefix) return NextResponse.next();

  const accessToken = request.cookies.get("access_token")?.value;
  if (!accessToken) return redirectToLogin(request);

  const userRaw = request.cookies.get("user")?.value;
  if (userRaw) {
    try {
      const user = JSON.parse(decodeURIComponent(userRaw)) as { role: string };
      const requiredRole = ROLE_PREFIXES[matchedPrefix];

      if (user.role !== requiredRole) {
        return NextResponse.redirect(
          new URL(`/${user.role}/dashboard`, request.url)
        );
      }
    } catch {
      // Cookie corrompido → força novo login e limpa sessão
      return redirectToLogin(request, true);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/supervisor/:path*", "/client/:path*"],
};
