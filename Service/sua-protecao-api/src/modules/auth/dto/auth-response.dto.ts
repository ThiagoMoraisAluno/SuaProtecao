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

/** Tipo público — exposto ao cliente via HTTP body (sem refreshToken) */
export type AuthPublicTokenDto = {
  accessToken: string;
};

/** Tipo público retornado no body após login/register */
export type AuthPublicResponseDto = AuthPublicTokenDto & {
  user: AuthUserDto;
};

/** Mantido para compatibilidade interna (service → controller) */
export type AuthResponseDto = AuthTokensDto & {
  user: AuthUserDto;
};
