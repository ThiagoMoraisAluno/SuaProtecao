import type { UserRole } from "@/types";

const SESSION_KEY = "access_token";

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

  // user cookie é httpOnly — gerenciado server-side via /api/auth/login e /api/auth/me
  saveTokens(accessToken: string, _user: StoredUser): void {
    this.setAccessToken(accessToken);
  },

  clearTokens(): void {
    _accessToken = undefined;
    if (typeof window !== "undefined") sessionStorage.removeItem(SESSION_KEY);
    // cookies httpOnly (refresh_token, user) são limpos pelo servidor via /api/auth/logout
  },
};
