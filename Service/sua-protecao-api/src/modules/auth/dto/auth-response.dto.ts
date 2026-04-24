import { UserRole } from '@prisma/client';

export type AuthUserDto = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
};

export type AuthTokensDto = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponseDto = AuthTokensDto & {
  user: AuthUserDto;
};
