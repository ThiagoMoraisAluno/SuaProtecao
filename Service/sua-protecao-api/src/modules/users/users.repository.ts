import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IUsersRepository } from './interfaces/users-repository.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.profile?.username ?? '',
      phone: user.profile?.phone ?? null,
      createdAt: user.createdAt,
    };
  }

  async upsertProfile(id: string, data: UpdateUserDto): Promise<void> {
    await this.prisma.userProfile.upsert({
      where: { id },
      update: {
        ...(data.name !== undefined && { username: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
      },
      create: {
        id,
        username: data.name ?? '',
        phone: data.phone,
      },
    });
  }
}
