import { Injectable } from '@nestjs/common';
import { ClientStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  IClientsRepository,
  CreateClientData,
} from './interfaces/clients-repository.interface';
import { AddClientAssetDto } from './dto/add-client-asset.dto';
import {
  ClientResponseDto,
  ClientListItemDto,
} from './dto/client-response.dto';

@Injectable()
export class ClientsRepository implements IClientsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(supervisorId?: string): Promise<ClientListItemDto[]> {
    const where = supervisorId ? { supervisorId } : {};
    const clients = await this.prisma.client.findMany({
      where,
      include: {
        user: { include: { profile: true } },
        plan: true,
        assets: true,
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
      supervisorId: c.supervisorId,
      totalAssetsValue: Number(c.totalAssetsValue),
      servicesUsedThisMonth: c.servicesUsedThisMonth,
      joinedAt: c.joinedAt,
      createdAt: c.createdAt,
    }));
  }

  async findById(id: string): Promise<ClientResponseDto | null> {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: { user: { include: { profile: true } }, plan: true, assets: true },
    });
    return client ? this.mapResponse(client) : null;
  }

  async findByUserId(userId: string): Promise<ClientResponseDto | null> {
    const client = await this.prisma.client.findUnique({
      where: { id: userId },
      include: { user: { include: { profile: true } }, plan: true, assets: true },
    });
    return client ? this.mapResponse(client) : null;
  }

  async findSupervisorId(clientId: string): Promise<string | null> {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: { supervisorId: true },
    });
    return client?.supervisorId ?? null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return !!user;
  }

  async existsByCpf(cpf: string): Promise<boolean> {
    const client = await this.prisma.client.findUnique({ where: { cpf } });
    return !!client;
  }

  async existsPlan(planId: string): Promise<boolean> {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    return !!plan;
  }

  async existsSupervisor(supervisorId: string): Promise<boolean> {
    const sup = await this.prisma.supervisor.findUnique({
      where: { id: supervisorId },
    });
    return !!sup;
  }

  async create(data: CreateClientData): Promise<string> {
    const { dto, passwordHash, totalAssetsValue, supervisorId } = data;
    const user = await this.prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          role: 'client',
          profile: { create: { username: dto.name, phone: dto.phone } },
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
      });
    });
    return user.id;
  }

  async updateStatus(id: string, status: ClientStatus): Promise<void> {
    await this.prisma.client.update({ where: { id }, data: { status } });
  }

  async addAsset(clientId: string, dto: AddClientAssetDto): Promise<void> {
    await this.prisma.clientAsset.create({
      data: { clientId, name: dto.name, estimatedValue: dto.estimatedValue },
    });
  }

  async removeAsset(clientId: string, assetId: string): Promise<boolean> {
    const asset = await this.prisma.clientAsset.findFirst({
      where: { id: assetId, clientId },
    });
    if (!asset) return false;
    await this.prisma.clientAsset.delete({ where: { id: assetId } });
    return true;
  }

  async recalculateAssetsValue(clientId: string): Promise<void> {
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
  }

  async updatePlan(
    clientId: string,
    planId: string,
    supervisorId?: string | null,
  ): Promise<void> {
    await this.prisma.client.update({
      where: { id: clientId },
      data: {
        planId,
        ...(supervisorId !== undefined && { supervisorId }),
      },
    });
  }

  async incrementServicesUsed(clientId: string): Promise<void> {
    await this.prisma.client.update({
      where: { id: clientId },
      data: { servicesUsedThisMonth: { increment: 1 } },
    });
  }

  private mapResponse(client: {
    id: string;
    cpf: string;
    phone: string | null;
    planId: string;
    supervisorId: string | null;
    status: ClientStatus;
    totalAssetsValue: { toString(): string };
    servicesUsedThisMonth: number;
    joinedAt: Date;
    lastPaymentAt: Date | null;
    addressStreet: string;
    addressNumber: string;
    addressComplement: string | null;
    addressNeighborhood: string;
    addressCity: string;
    addressState: string;
    addressZipCode: string;
    createdAt: Date;
    user: {
      email: string;
      role: import('@prisma/client').UserRole;
      profile: { username: string; phone: string | null } | null;
    };
    assets: { id: string; name: string; estimatedValue: { toString(): string } }[];
  }): ClientResponseDto {
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
}
