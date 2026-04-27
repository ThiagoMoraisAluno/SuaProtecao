import Cookies from "js-cookie";
import type { UserRole } from "@/types";

const SESSION_KEY = "access_token";
const USER_COOKIE  = "user";
const COOKIE_OPTS  = { secure: true, sameSite: "lax" as const };

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

// ── Access token ─────────────────────────────────────────────────────────────
// Armazenado em variável de módulo + sessionStorage.
// NÃO vai para cookie → JS de terceiros nunca consegue lê-lo.
// Ao fechar o browser, sessionStorage é limpo; na próxima abertura, o
// refreshInterceptor renova automaticamente via cookie httpOnly.

let _accessToken: string | undefined;

function readSession(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return sessionStorage.getItem(SESSION_KEY) ?? undefined;
}

// ── API pública ───────────────────────────────────────────────────────────────

export const tokenService = {
  getAccessToken(): string | undefined {
    return _accessToken ?? readSession();
  },

  setAccessToken(token: string): void {
    _accessToken = token;
    if (typeof window !== "undefined") sessionStorage.setItem(SESSION_KEY, token);
  },

  getUser(): StoredUser | null {
    const raw = Cookies.get(USER_COOKIE);
    if (!raw) return null;
    try {
      return JSON.parse(decodeURIComponent(raw)) as StoredUser;
    } catch {
      return null;
    }
  },

  // refreshToken é gerenciado pelo servidor (cookie httpOnly) — não passa por aqui
  saveTokens(accessToken: string, user: StoredUser): void {
    this.setAccessToken(accessToken);
    Cookies.set(USER_COOKIE, encodeURIComponent(JSON.stringify(user)), COOKIE_OPTS);
  },

  clearTokens(): void {
    _accessToken = undefined;
    if (typeof window !== "undefined") sessionStorage.removeItem(SESSION_KEY);
    Cookies.remove(USER_COOKIE);
    // refresh_token é limpo pelo servidor via /api/auth/logout
  },
};
