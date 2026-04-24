import { UserRole } from '@prisma/client';
import { RegisterDto } from '../dto/register.dto';

export interface UserWithProfile {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  profile: { username: string; phone: string | null } | null;
}

export interface UserBasic {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export interface PlanExists {
  id: string;
}

export interface StoredRefreshToken {
  id: string;
  expiresAt: Date;
  user: { id: string; email: string; role: UserRole };
}

export interface StoredResetToken {
  id: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
}

export interface CreateClientUserData {
  dto: RegisterDto;
  passwordHash: string;
  totalAssetsValue: number;
}

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<UserBasic | null>;
  findUserWithProfileById(id: string): Promise<UserWithProfile | null>;
  findPlanById(id: string): Promise<PlanExists | null>;
  createClientUser(data: CreateClientUserData): Promise<UserWithProfile>;
  storeRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;
  findRefreshToken(tokenHash: string): Promise<StoredRefreshToken | null>;
  deleteRefreshToken(id: string): Promise<void>;
  deleteAllRefreshTokens(userId: string): Promise<void>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
  createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;
  findPasswordResetToken(tokenHash: string): Promise<StoredResetToken | null>;
  markPasswordResetTokenUsed(id: string): Promise<void>;
}

export const AUTH_REPOSITORY_TOKEN = 'AUTH_REPOSITORY';
