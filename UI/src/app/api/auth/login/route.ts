import { NextResponse, type NextRequest } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL!;

interface LoginEnvelope {
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      phone?: string;
    };
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json() as LoginEnvelope | { message: string };

  if (!res.ok) {
    return NextResponse.json(json, { status: res.status });
  }

  const { accessToken, refreshToken, user } = (json as LoginEnvelope).data;

  const response = NextResponse.json({ accessToken, user });

  // refresh_token fica em cookie httpOnly — JS do browser nunca consegue lê-lo
  response.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });

  return response;
}
