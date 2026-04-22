import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ClientStatus } from '@prisma/client';

@Injectable()
export class SupervisorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateSupervisorDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('E-mail já cadastrado.');
    }

    const rounds = this.configService.get<number>('BCRYPT_ROUNDS') ?? 12;
    const passwordHash = await bcrypt.hash(dto.password, rounds);

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          role: 'supervisor',
          profile: {
            create: {
              username: dto.name,
              phone: dto.phone,
            },
          },
          supervisor: {
            create: {
              commission: dto.commission,
            },
          },
        },
        include: {
          profile: true,
          supervisor: true,
        },
      });
      return newUser;
    });

    return this.formatSupervisor(user.id);
  }

  async findAll() {
    const supervisors = await this.prisma.supervisor.findMany({
      include: {
        user: { include: { profile: true } },
        clients: { select: { status: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return supervisors.map((s) => this.mapSupervisorResponse(s));
  }

  async findOne(id: string, requester: JwtPayload) {
    if (requester.role === 'supervisor' && requester.sub !== id) {
      throw new ForbiddenException('Acesso negado.');
    }

    const supervisor = await this.prisma.supervisor.findUnique({
      where: { id },
      include: {
        user: { include: { profile: true } },
        clients: { select: { status: true } },
      },
    });

    if (!supervisor) {
      throw new NotFoundException('Supervisor não encontrado.');
    }

    return this.mapSupervisorResponse(supervisor);
  }

  async getClients(supervisorId: string, requester: JwtPayload) {
    if (requester.role === 'supervisor' && requester.sub !== supervisorId) {
      throw new ForbiddenException('Acesso negado.');
    }

    const clients = await this.prisma.client.findMany({
      where: { supervisorId },
      include: {
        user: { include: { profile: true } },
        plan: true,
      },
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

  async getCommission(supervisorId: string, requester: JwtPayload) {
    if (requester.role === 'supervisor' && requester.sub !== supervisorId) {
      throw new ForbiddenException('Acesso negado.');
    }

    const supervisor = await this.prisma.supervisor.findUnique({
      where: { id: supervisorId },
      include: {
        clients: {
          where: { status: ClientStatus.active },
          include: { plan: true },
        },
      },
    });

    if (!supervisor) {
      throw new NotFoundException('Supervisor não encontrado.');
    }

    const commission = Number(supervisor.commission);
    const totalRevenue = supervisor.clients.reduce(
      (sum, client) => sum + Number(client.plan.price),
      0,
    );
    const estimatedCommission = totalRevenue * (commission / 100);

    return {
      supervisorId,
      commissionPercentage: commission,
      activeClients: supervisor.clients.length,
      totalActiveRevenue: totalRevenue,
      estimatedMonthlyCommission: Number(estimatedCommission.toFixed(2)),
    };
  }

  private async formatSupervisor(supervisorId: string) {
    const supervisor = await this.prisma.supervisor.findUnique({
      where: { id: supervisorId },
      include: {
        user: { include: { profile: true } },
        clients: { select: { status: true } },
      },
    });

    if (!supervisor) {
      throw new NotFoundException('Supervisor não encontrado.');
    }

    return this.mapSupervisorResponse(supervisor);
  }

  private mapSupervisorResponse(supervisor: {
    id: string;
    commission: { toString(): string };
    createdAt: Date;
    user: {
      email: string;
      profile: { username: string; phone: string | null } | null;
    };
    clients: { status: ClientStatus }[];
  }) {
    const totalClients = supervisor.clients.length;
    const activeClients = supervisor.clients.filter(
      (c) => c.status === ClientStatus.active,
    ).length;
    const defaulterClients = supervisor.clients.filter(
      (c) => c.status === ClientStatus.defaulter,
    ).length;

    return {
      id: supervisor.id,
      name: supervisor.user.profile?.username ?? '',
      email: supervisor.user.email,
      phone: supervisor.user.profile?.phone ?? null,
      commission: Number(supervisor.commission),
      totalClients,
      activeClients,
      defaulterClients,
      createdAt: supervisor.createdAt,
    };
  }
}
