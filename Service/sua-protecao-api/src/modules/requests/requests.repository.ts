import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma, RequestStatus, RequestType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  IRequestsRepository,
  ClientForRequest,
  RequestRecord,
  ServiceRuleEnforcement,
} from './interfaces/requests-repository.interface';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { CreateCoverageRequestDto } from './dto/create-coverage-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestResponseDto } from './dto/request-response.dto';

type PrismaRequestWithService = {
  id: string;
  clientId: string;
  clientName: string;
  type: RequestType;
  description: string;
  status: RequestStatus;
  adminNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  serviceType: string | null;
  serviceId: string | null;
  desiredDate: Date | null;
  coverageType: string | null;
  estimatedLoss: { toString(): string } | null;
  approvedAmount: { toString(): string } | null;
  evidenceUrls: string[];
  service?: { name: string; slug: string; icon: string | null } | null;
};

@Injectable()
export class RequestsRepository implements IRequestsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findClientForRequest(clientId: string): Promise<ClientForRequest | null> {
    return this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        plan: { select: { coverageLimit: true } },
        user: { include: { profile: true } },
        supervisor: { include: { user: { include: { profile: true } } } },
      },
    });
  }

  async sumApprovedCoverageThisYear(clientId: string): Promise<number> {
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const result = await this.prisma.request.aggregate({
      where: {
        clientId,
        type: RequestType.coverage,
        status: RequestStatus.approved,
        createdAt: { gte: yearStart },
      },
      _sum: { approvedAmount: true },
    });
    return Number(result._sum.approvedAmount ?? 0);
  }

  async createServiceRequest(
    dto: CreateServiceRequestDto,
    clientId: string,
    clientName: string,
    rule: ServiceRuleEnforcement,
  ): Promise<RequestResponseDto> {
    try {
      const request = await this.prisma.$transaction(
        async (tx) => {
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const yearStart = new Date(now.getFullYear(), 0, 1);

          if (rule.maxPerMonth !== -1) {
            const usedMonth = await tx.request.count({
              where: {
                clientId,
                serviceId: rule.serviceId,
                type: RequestType.service,
                createdAt: { gte: monthStart },
              },
            });
            if (usedMonth >= rule.maxPerMonth) {
              throw new ForbiddenException(
                `Limite mensal de ${rule.maxPerMonth} chamado(s) atingido para este serviço.`,
              );
            }
          }

          if (rule.maxPerYear !== -1) {
            const usedYear = await tx.request.count({
              where: {
                clientId,
                serviceId: rule.serviceId,
                type: RequestType.service,
                createdAt: { gte: yearStart },
              },
            });
            if (usedYear >= rule.maxPerYear) {
              throw new ForbiddenException(
                `Limite anual de ${rule.maxPerYear} chamado(s) atingido para este serviço.`,
              );
            }
          }

          const newRequest = await tx.request.create({
            data: {
              clientId,
              clientName,
              type: RequestType.service,
              description: dto.description,
              status: RequestStatus.pending,
              serviceId: rule.serviceId,
              desiredDate: new Date(dto.desiredDate),
            },
            include: { service: { select: { name: true, slug: true, icon: true } } },
          });

          // Mantém contador agregado do cliente (usado por dashboards de compat)
          await tx.client.update({
            where: { id: clientId },
            data: { servicesUsedThisMonth: { increment: 1 } },
          });

          return newRequest;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
      return this.mapRequest(request);
    } catch (error) {
      const e = error as { code?: string };
      if (e.code === 'P2034') {
        throw new ForbiddenException(
          'Conflito ao registrar o chamado. Tente novamente.',
        );
      }
      throw error;
    }
  }

  async createCoverageRequest(
    dto: CreateCoverageRequestDto,
    clientId: string,
    clientName: string,
  ): Promise<RequestResponseDto> {
    const request = await this.prisma.request.create({
      data: {
        clientId,
        clientName,
        type: RequestType.coverage,
        description: dto.description,
        status: RequestStatus.analyzing,
        coverageType: dto.coverageType,
        estimatedLoss: dto.estimatedLoss,
        evidenceUrls: dto.evidenceUrls ?? [],
      },
    });
    return this.mapRequest(request);
  }

  async findAll(): Promise<RequestResponseDto[]> {
    const requests = await this.prisma.request.findMany({
      orderBy: { createdAt: 'desc' },
      include: { service: { select: { name: true, slug: true, icon: true } } },
    });
    return requests.map((r) => this.mapRequest(r));
  }

  async findByClientId(clientId: string): Promise<RequestResponseDto[]> {
    const requests = await this.prisma.request.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      include: { service: { select: { name: true, slug: true, icon: true } } },
    });
    return requests.map((r) => this.mapRequest(r));
  }

  async findById(id: string): Promise<RequestResponseDto | null> {
    const request = await this.prisma.request.findUnique({
      where: { id },
      include: { service: { select: { name: true, slug: true, icon: true } } },
    });
    return request ? this.mapRequest(request) : null;
  }

  async findRecordById(id: string): Promise<RequestRecord | null> {
    return this.prisma.request.findUnique({
      where: { id },
      select: { id: true, type: true, status: true, clientId: true },
    });
  }

  async update(id: string, dto: UpdateRequestDto): Promise<RequestResponseDto> {
    const updated = await this.prisma.request.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.adminNotes !== undefined && { adminNotes: dto.adminNotes }),
        ...(dto.approvedAmount !== undefined && {
          approvedAmount: dto.approvedAmount,
        }),
      },
      include: { service: { select: { name: true, slug: true, icon: true } } },
    });
    return this.mapRequest(updated);
  }

  private mapRequest(request: PrismaRequestWithService): RequestResponseDto {
    return {
      id: request.id,
      clientId: request.clientId,
      clientName: request.clientName,
      type: request.type,
      description: request.description,
      status: request.status,
      adminNotes: request.adminNotes,
      serviceId: request.serviceId,
      // Para retrocompat, expõe slug em serviceType (consumidores antigos esperavam essa string)
      serviceType: request.service?.slug ?? request.serviceType,
      serviceName: request.service?.name ?? null,
      serviceIcon: request.service?.icon ?? null,
      desiredDate: request.desiredDate,
      coverageType: request.coverageType,
      estimatedLoss: request.estimatedLoss ? Number(request.estimatedLoss) : null,
      approvedAmount: request.approvedAmount
        ? Number(request.approvedAmount)
        : null,
      evidenceUrls: request.evidenceUrls,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }
}
