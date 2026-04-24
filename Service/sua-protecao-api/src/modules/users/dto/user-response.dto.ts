import { UserRole } from '@prisma/client';

export type UserResponseDto = {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone: string | null;
  createdAt: Date;
};
