import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const API = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

const loginBodySchema = z.object({
  email: z.string().email().min(1).max(254),
  password: z.string().min(1).max(128),
});

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
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Corpo inválido." }, { status: 400 });
  }

  const parsed = loginBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Credenciais inválidas." }, { status: 400 });
  }

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
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

  // user fica em cookie httpOnly — inacessível ao JS do browser, evita manipulação de role
  response.cookies.set("user", JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });

  return response;
}
