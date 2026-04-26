import { tokenService } from "@/infrastructure/auth/tokenService";

export function handleAuthFailure(): void {
  tokenService.clearTokens();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
