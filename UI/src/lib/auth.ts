// Shim de compatibilidade — implementação real em src/infrastructure/auth/tokenService.ts
import { tokenService } from "@/infrastructure/auth/tokenService";
import type { StoredUser } from "@/infrastructure/auth/tokenService";

export type { StoredUser as AuthUser } from "@/infrastructure/auth/tokenService";

// saveTokens não recebe mais refreshToken — ele é gerenciado pelo servidor (httpOnly cookie)
export const saveTokens   = (accessToken: string, user: StoredUser) => tokenService.saveTokens(accessToken, user);
export const clearTokens  = () => tokenService.clearTokens();
export const getAccessToken = () => tokenService.getAccessToken();
export const getUser      = () => tokenService.getUser();
