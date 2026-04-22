import { UserRole } from '@prisma/client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}
