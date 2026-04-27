import { UserRole } from '@prisma/client';

export type AuthUserDto = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
};

/** Tipo interno — inclui refreshToken para uso entre service e controller */
export type AuthTokensDto = {
  accessToken: string;
  refreshToken: string;
};

/**
 * Tipo público — exposto ao cliente via HTTP body.
 * Inclui refreshToken porque o consumidor primário é um BFF (Next.js API routes
 * em domínio diferente), que precisa ler o token do body para setar o cookie
 * HttpOnly no domínio do browser. O refreshToken também continua sendo enviado
 * como cookie (setAuthCookies) para consumidores same-origin/diretos.
 */
export type AuthPublicTokenDto = {
  accessToken: string;
  refreshToken: string;
};

/** Tipo público retornado no body após login/register */
export type AuthPublicResponseDto = AuthPublicTokenDto & {
  user: AuthUserDto;
};

/** Mantido para compatibilidade interna (service → controller) */
export type AuthResponseDto = AuthTokensDto & {
  user: AuthUserDto;
};
