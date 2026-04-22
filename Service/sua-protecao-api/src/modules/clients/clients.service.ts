import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { ClientStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientStatusDto } from './dto/update-client-status.dto';
import { AddClientAssetDto } from './dto/add-client-asset.dto';
import { UpdateClientPlanDto } from './dto/update-client-plan.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateClientDto, requester: JwtPayload) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('E-mail já cadastrado.');
    }

    const existingCpf = await this.prisma.client.findUnique({
      where: { cpf: dto.cpf },
    });
    if (existingCpf) {
      throw new ConflictException('CPF já cadastrado.');
    }

    const plan = await this.prisma.plan.findUnique({ where: { id: dto.planId } });
    if (!plan) {
      throw new NotFoundException('Plano não encontrado.');
    }

    // Supervisor creating client — assign to themselves if no supervisorId provided
    let supervisorId = dto.supervisorId;
    if (requester.role === 'supervisor' && !supervisorId) {
      supervisorId = requester.sub;
    }

    if (supervisorId) {
      const supervisor = await this.prisma.supervisor.findUnique({
        where: { id: supervisorId },
      });
      if (!supervisor) {
        throw new NotFoundException('Supervisor não encontrado.');
      }
    }

    const rounds = this.configService.get<number>('BCRYPT_ROUNDS') ?? 12;
    const passwordHash = await bcrypt.hash(dto.password, rounds);

    const totalAssetsValue = dto.assets.reduce(
      (sum, asset) => sum + asset.estimatedValue,
      0,
    );

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
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
              supervisorId,
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
        include: { profile: true, client: { include: { assets: true, plan: true } } },
      });
      return newUser;
    });

    return this.formatClientResponse(user.id);
  }

  async findAll(requester: JwtPayload) {
    const where =
      requester.role === 'supervisor' ? { supervisorId: requester.sub } : {};

    const clients = await this.prisma.client.findMany({
      where,
      include: {
        user: { include: { profile: true } },
        plan: true,
        assets: true,
      },
      orderBy: { joinedAt: 'desc' },
    });

    return clients.map((c) => this.mapClientListItem(c));
  }

  async findBysupervisor(supervisorId: string, requester: JwtPayload) {
    if (requester.role === 'supervisor' && requester.sub !== supervisorId) {
      throw new ForbiddenException('Acesso negado.');
    }

    const clients = await this.prisma.client.findMany({
      where: { supervisorId },
      include: {
        user: { include: { profile: true } },
        plan: true,
        assets: true,
      },
      orderBy: { joinedAt: 'desc' },
    });

    return clients.map((c) => this.mapClientListItem(c));
  }

  async findMyData(userId: string) {
    return this.formatClientResponse(userId);
  }

  async findOne(id: string, requester: JwtPayload) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      select: { id: true, supervisorId: true },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    // Access control: client can only see themselves; supervisor only their clients
    if (requester.role === 'client' && requester.sub !== id) {
      throw new ForbiddenException('Acesso negado.');
    }

    if (
      requester.role === 'supervisor' &&
      client.supervisorId !== requester.sub
    ) {
      throw new ForbiddenException('Acesso negado.');
    }

    return this.formatClientResponse(id);
  }

  async updateStatus(id: string, dto: UpdateClientStatusDto) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    await this.prisma.client.update({
      where: { id },
      data: { status: dto.status },
    });

    return this.formatClientResponse(id);
  }

  async addAsset(clientId: string, dto: AddClientAssetDto) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!client) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    await this.prisma.clientAsset.create({
      data: {
        clientId,
        name: dto.name,
        estimatedValue: dto.estimatedValue,
      },
    });

    // Recalculate totalAssetsValue
    const assets = await this.prisma.clientAsset.findMany({
      where: { clientId },
    });
    const totalAssetsValue = assets.reduce(
      (sum, a) => sum + Number(a.estimatedValue),
      0,
    );
    await this.prisma.client.update({
      where: { id: clientId },
      data: { totalAssetsValue },
    });

    return this.formatClientResponse(clientId);
  }

  async removeAsset(clientId: string, assetId: string) {
    const asset = await this.prisma.clientAsset.findFirst({
      where: { id: assetId, clientId },
    });
    if (!asset) {
      throw new NotFoundException('Bem não encontrado.');
    }

    await this.prisma.clientAsset.delete({ where: { id: assetId } });

    // Recalculate totalAssetsValue
    const assets = await this.prisma.clientAsset.findMany({
      where: { clientId },
    });
    const totalAssetsValue = assets.reduce(
      (sum, a) => sum + Number(a.estimatedValue),
      0,
    );
    await this.prisma.client.update({
      where: { id: clientId },
      data: { totalAssetsValue },
    });

    return { message: 'Bem removido com sucesso.' };
  }

  async updatePlan(clientId: string, dto: UpdateClientPlanDto) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!client) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    const plan = await this.prisma.plan.findUnique({ where: { id: dto.planId } });
    if (!plan) {
      throw new NotFoundException('Plano não encontrado.');
    }

    await this.prisma.client.update({
      where: { id: clientId },
      data: {
        planId: dto.planId,
        ...(dto.supervisorId !== undefined && { supervisorId: dto.supervisorId }),
      },
    });

    return this.formatClientResponse(clientId);
  }

  async incrementServicesUsed(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!client) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    return this.prisma.client.update({
      where: { id: clientId },
      data: { servicesUsedThisMonth: { increment: 1 } },
    });
  }

  private async formatClientResponse(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        user: { include: { profile: true } },
        plan: true,
        assets: true,
      },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    return {
      id: client.id,
      name: client.user.profile?.username ?? '',
      email: client.user.email,
      role: client.user.role,
      cpf: client.cpf,
      phone: client.phone,
      planId: client.planId,
      supervisorId: client.supervisorId,
      status: client.status,
      totalAssetsValue: Number(client.totalAssetsValue),
      servicesUsedThisMonth: client.servicesUsedThisMonth,
      joinedAt: client.joinedAt,
      lastPaymentAt: client.lastPaymentAt,
      address: {
        street: client.addressStreet,
        number: client.addressNumber,
        complement: client.addressComplement,
        neighborhood: client.addressNeighborhood,
        city: client.addressCity,
        state: client.addressState,
        zipCode: client.addressZipCode,
      },
      assets: client.assets.map((a) => ({
        id: a.id,
        name: a.name,
        estimatedValue: Number(a.estimatedValue),
      })),
      createdAt: client.createdAt,
    };
  }

  private mapClientListItem(client: {
    id: string;
    cpf: string;
    phone: string | null;
    planId: string;
    supervisorId: string | null;
    status: ClientStatus;
    totalAssetsValue: { toString(): string };
    servicesUsedThisMonth: number;
    joinedAt: Date;
    createdAt: Date;
    user: {
      email: string;
      profile: { username: string; phone: string | null } | null;
    };
    plan: { name: string };
    assets: { id: string; name: string; estimatedValue: { toString(): string } }[];
  }) {
    return {
      id: client.id,
      name: client.user.profile?.username ?? '',
      email: client.user.email,
      cpf: client.cpf,
      phone: client.phone,
      status: client.status,
      planId: client.planId,
      planName: client.plan.name,
      supervisorId: client.supervisorId,
      totalAssetsValue: Number(client.totalAssetsValue),
      servicesUsedThisMonth: client.servicesUsedThisMonth,
      joinedAt: client.joinedAt,
      createdAt: client.createdAt,
    };
  }
}
