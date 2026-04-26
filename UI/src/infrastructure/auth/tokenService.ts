import Cookies from "js-cookie";
import type { UserRole } from "@/types";

const COOKIE_OPTIONS = { secure: true, sameSite: "lax" as const };

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export const tokenService = {
  getAccessToken(): string | undefined {
    return Cookies.get("access_token");
  },

  getRefreshToken(): string | undefined {
    return Cookies.get("refresh_token");
  },

  getUser(): StoredUser | null {
    const raw = Cookies.get("user");
    if (!raw) return null;
    try {
      return JSON.parse(decodeURIComponent(raw)) as StoredUser;
    } catch {
      return null;
    }
  },

  saveTokens(accessToken: string, refreshToken: string, user: StoredUser): void {
    Cookies.set("access_token", accessToken, COOKIE_OPTIONS);
    Cookies.set("refresh_token", refreshToken, COOKIE_OPTIONS);
    Cookies.set("user", encodeURIComponent(JSON.stringify(user)), COOKIE_OPTIONS);
  },

  setAccessToken(token: string): void {
    Cookies.set("access_token", token, COOKIE_OPTIONS);
  },

  clearTokens(): void {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("user");
  },
};
