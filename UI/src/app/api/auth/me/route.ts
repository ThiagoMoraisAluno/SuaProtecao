import { NextResponse, type NextRequest } from "next/server";
import type { StoredUser } from "@/infrastructure/auth/tokenService";

// Session probe: retorna o usuário se houver sessão, ou null se anônimo.
// Sempre 200 — o cliente trata `null` como "não logado". Evita 401 ruidoso
// no console quando a landing page hidrata o AuthContext sem sessão ativa.
export async function GET(request: NextRequest) {
  const userRaw = request.cookies.get("user")?.value;
  if (!userRaw) return NextResponse.json(null);

  try {
    const user = JSON.parse(userRaw) as StoredUser;
    return NextResponse.json(user);
  } catch {
    return NextResponse.json(null);
  }
}
