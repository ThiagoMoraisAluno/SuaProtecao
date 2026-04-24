import { UserRole } from '@prisma/client';

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface ISessionService {
  create(userId: string, plainToken: string): Promise<void>;
  rotateToken(
    plainToken: string,
  ): Promise<{ user: SessionUser } | null>;
  invalidate(plainToken: string): Promise<void>;
  invalidateAll(userId: string): Promise<void>;
}

export const SESSION_SERVICE_TOKEN = 'SESSION_SERVICE';
