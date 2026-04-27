import { NextResponse, type NextRequest } from "next/server";

const API = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization") ?? "";
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // Best-effort: notifica o backend para invalidar a sessão
  try {
    await fetch(`${API}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // ignora falhas de rede — o importante é limpar o cookie
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete("refresh_token");
  response.cookies.delete("user");
  return response;
}
