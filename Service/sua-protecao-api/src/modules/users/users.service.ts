import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.profile?.username ?? '',
      phone: user.profile?.phone ?? null,
      createdAt: user.createdAt,
    };
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    await this.prisma.userProfile.upsert({
      where: { id: userId },
      update: {
        ...(dto.name !== undefined && { username: dto.name }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
      create: {
        id: userId,
        username: dto.name ?? '',
        phone: dto.phone,
      },
    });

    return this.getMe(userId);
  }
}
