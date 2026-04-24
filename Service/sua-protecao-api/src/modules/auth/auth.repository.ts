import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  IAuthRepository,
  UserWithProfile,
  UserBasic,
  PlanExists,
  StoredRefreshToken,
  StoredResetToken,
  CreateClientUserData,
} from './interfaces/auth-repository.interface';
import { handlePrismaUniqueError } from '../../common/helpers/prisma-error.helper';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  // P1: busca sem profile — validação de senha primeiro
  async findUserByEmail(email: string): Promise<UserBasic | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true, role: true },
    });
  }

  async findUserWithProfileById(id: string): Promise<UserWithProfile | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async findPlanById(id: string): Promise<PlanExists | null> {
    return this.prisma.plan.findUnique({ where: { id } });
  }

  async createClientUser(data: CreateClientUserData): Promise<UserWithProfile> {
    const { dto, passwordHash, totalAssetsValue } = data;
    try {
      return await this.prisma.$transaction(async (tx) => {
        return tx.user.create({
          data: {
            email: dto.email,
            passwordHash,
            role: 'client',
            profile: {
              create: {
                username: dto.name,
                phone: dto.phone,
              },
            },
            client: {
              create: {
                cpf: dto.cpf,
                phone: dto.phone,
                planId: dto.planId,
                totalAssetsValue,
                addressStreet: dto.addressStreet,
                addressNumber: dto.addressNumber,
                addressComplement: dto.addressComplement,
                addressNeighborhood: dto.addressNeighborhood,
                addressCity: dto.addressCity,
                addressState: dto.addressState,
                addressZipCode: dto.addressZipCode,
                assets: {
                  create: dto.assets.map((a) => ({
                    name: a.name,
                    estimatedValue: a.estimatedValue,
                  })),
                },
              },
            },
          },
          include: { profile: true },
        });
      });
    } catch (error) {
      handlePrismaUniqueError(error, {
        email: 'E-mail já cadastrado.',
        cpf: 'CPF já cadastrado.',
      });
    }
  }

  // S1: armazena tokenHash (SHA-256), nunca o token em texto puro
  async storeRefreshToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.prisma.refreshToken.create({
      data: { token: tokenHash, userId, expiresAt },
    });
  }

  // S2: busca pelo hash, nunca pelo token puro
  async findRefreshToken(tokenHash: string): Promise<StoredRefreshToken | null> {
    return this.prisma.refreshToken.findUnique({
      where: { token: tokenHash },
      include: { user: { select: { id: true, email: true, role: true } } },
    });
  }

  async deleteRefreshToken(id: string): Promise<void> {
    await this.prisma.refreshToken.delete({ where: { id } });
  }

  async deleteAllRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  // S5: cria registro de reset token com hash
  async createPasswordResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.prisma.passwordResetToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  // S5: busca pelo hash do token
  async findPasswordResetToken(
    tokenHash: string,
  ): Promise<StoredResetToken | null> {
    return this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });
  }

  // S5: marca como usado imediatamente após o reset
  async markPasswordResetTokenUsed(id: string): Promise<void> {
    await this.prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }
}
