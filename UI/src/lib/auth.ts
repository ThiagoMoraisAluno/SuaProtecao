// Shim de compatibilidade — mantém todos os imports existentes funcionando.
// A implementação real está em src/infrastructure/auth/tokenService.ts
import { tokenService } from "@/infrastructure/auth/tokenService";
import type { StoredUser } from "@/infrastructure/auth/tokenService";

export type { StoredUser as AuthUser } from "@/infrastructure/auth/tokenService";

export const saveTokens = (
  accessToken: string,
  refreshToken: string,
  user: StoredUser
) => tokenService.saveTokens(accessToken, refreshToken, user);

export const clearTokens = () => tokenService.clearTokens();
export const getAccessToken = () => tokenService.getAccessToken();
export const getRefreshToken = () => tokenService.getRefreshToken();
export const getUser = () => tokenService.getUser();
