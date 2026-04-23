import Cookies from "js-cookie";
import type { AuthUser } from "@/contexts/AuthContext";

const COOKIE_OPTIONS = { secure: true, sameSite: "lax" as const };

export function saveTokens(accessToken: string, refreshToken: string, user: AuthUser) {
  Cookies.set("access_token", accessToken, COOKIE_OPTIONS);
  Cookies.set("refresh_token", refreshToken, COOKIE_OPTIONS);
  Cookies.set("user", encodeURIComponent(JSON.stringify(user)), COOKIE_OPTIONS);
}

export function clearTokens() {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
  Cookies.remove("user");
}

export function getAccessToken(): string | undefined {
  return Cookies.get("access_token");
}

export function getRefreshToken(): string | undefined {
  return Cookies.get("refresh_token");
}

export function getUser(): AuthUser | null {
  const userCookie = Cookies.get("user");
  if (!userCookie) return null;
  try {
    return JSON.parse(decodeURIComponent(userCookie)) as AuthUser;
  } catch {
    return null;
  }
}
