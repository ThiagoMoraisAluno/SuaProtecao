import { NextResponse, type NextRequest } from "next/server";

const API = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

interface RefreshEnvelope {
  data: { accessToken: string };
}

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(`${API}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    // Refresh token expirado ou inválido — limpa o cookie e força novo login
    const response = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    response.cookies.delete("refresh_token");
    return response;
  }

  const json = await res.json() as RefreshEnvelope;
  const { accessToken } = json.data;

  return NextResponse.json({ accessToken });
}
