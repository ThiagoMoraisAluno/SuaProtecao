import { ConflictException } from '@nestjs/common';

interface PrismaError {
  code?: string;
  meta?: { target?: string[] };
}

export function handlePrismaUniqueError(
  error: unknown,
  fieldMessages: Record<string, string>,
  fallback = 'Registro duplicado.',
): never {
  const e = error as PrismaError;
  if (e.code === 'P2002') {
    const field = e.meta?.target?.[0] ?? '';
    throw new ConflictException(fieldMessages[field] ?? fallback);
  }
  throw error;
}
