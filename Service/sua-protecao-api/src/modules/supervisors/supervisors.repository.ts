import { Injectable } from '@nestjs/common';
import { ClientStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ISupervisorsRepository } from './interfaces/supervisors-repository.interface';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import {
  SupervisorResponseDto,
  SupervisorClientItemDto,
  SupervisorCommissionDto,
} from './dto/supervisor-response.dto';

@Injectable()
export class SupervisorsRepository implements ISupervisorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return !!user;
  }

  async create(dto: CreateSupervisorDto, passwordHash: string): Promise<string> {
    const user = await this.prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          role: 'supervisor',
          profile: { create: { username: dto.name, phone: dto.phone } },
          supervisor: { create: { commission: dto.commission } },
        },
      });
    });
    return user.id;
  }

  async findAll(): Promise<SupervisorResponseDto[]> {
    const supervisors = await this.prisma.supervisor.findMany({
      include: {
        user: { include: { profile: true } },
        clients: { select: { status: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return supervisors.map((s) => this.mapSupervisor(s));
  }

  async findById(id: string): Promise<SupervisorResponseDto | null> {
    const supervisor = await this.prisma.supervisor.findUnique({
      where: { id },
      include: {
        user: { include: { profile: true } },
        clients: { select: { status: true } },
      },
    });
    return supervisor ? this.mapSupervisor(supervisor) : null;
  }

  async findClients(supervisorId: string): Promise<SupervisorClientItemDto[]> {
    const clients = await this.prisma.client.findMany({
      where: { supervisorId },
      include: { user: { include: { profile: true } }, plan: true },
      orderBy: { joinedAt: 'desc' },
    });
    return clients.map((c) => ({
      id: c.id,
      name: c.user.profile?.username ?? '',
      email: c.user.email,
      cpf: c.cpf,
      phone: c.phone,
      status: c.status,
      planId: c.planId,
      planName: c.plan.name,
      joinedAt: c.joinedAt,
    }));
  }

  async getCommission(supervisorId: string): Promise<SupervisorCommissionDto | null> {
    const supervisor = await this.prisma.supervisor.findUnique({
      where: { id: supervisorId },
      include: {
        clients: {
          where: { status: ClientStatus.active },
          include: { plan: true },
        },
      },
    });

    if (!supervisor) return null;

    const commission = Number(supervisor.commission);
    const totalRevenue = supervisor.clients.reduce(
      (sum, c) => sum + Number(c.plan.price),
      0,
    );

    return {
      supervisorId,
      commissionPercentage: commission,
      activeClients: supervisor.clients.length,
      totalActiveRevenue: totalRevenue,
      estimatedMonthlyCommission: Number(
        (totalRevenue * (commission / 100)).toFixed(2),
      ),
    };
  }

  private mapSupervisor(supervisor: {
    id: string;
    commission: { toString(): string };
    createdAt: Date;
    user: {
      email: string;
      profile: { username: string; phone: string | null } | null;
    };
    clients: { status: ClientStatus }[];
  }): SupervisorResponseDto {
    return {
      id: supervisor.id,
      name: supervisor.user.profile?.username ?? '',
      email: supervisor.user.email,
      phone: supervisor.user.profile?.phone ?? null,
      commission: Number(supervisor.commission),
      totalClients: supervisor.clients.length,
      activeClients: supervisor.clients.filter(
        (c) => c.status === ClientStatus.active,
      ).length,
      defaulterClients: supervisor.clients.filter(
        (c) => c.status === ClientStatus.defaulter,
      ).length,
      createdAt: supervisor.createdAt,
    };
  }
}
