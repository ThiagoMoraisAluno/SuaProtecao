import { Injectable, ForbiddenException } from '@nestjs/common';
import { Prisma, RequestStatus, RequestType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  IRequestsRepository,
  ClientForRequest,
  RequestRecord,
} from './interfaces/requests-repository.interface';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { CreateCoverageRequestDto } from './dto/create-coverage-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestResponseDto } from './dto/request-response.dto';

@Injectable()
export class RequestsRepository implements IRequestsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findClientForRequest(clientId: string): Promise<ClientForRequest | null> {
    return this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        plan: { select: { servicesPerMonth: true, coverageLimit: true } },
        user: { include: { profile: true } },
      },
    });
  }

  async createServiceRequest(
    dto: CreateServiceRequestDto,
    clientId: string,
    clientName: string,
    servicesPerMonth: number,
  ): Promise<RequestResponseDto> {
    try {
      const request = await this.prisma.$transaction(
        async (tx) => {
          // Re-leitura dentro da transação — SSI detecta conflito se outro TX já incrementou
          const fresh = await tx.client.findUnique({
            where: { id: clientId },
            select: { servicesUsedThisMonth: true },
          });
          if (
            servicesPerMonth !== -1 &&
            fresh!.servicesUsedThisMonth >= servicesPerMonth
          ) {
            throw new ForbiddenException(
              'Limite de serviços do mês atingido para o plano contratado.',
            );
          }
          const newRequest = await tx.request.create({
            data: {
              clientId,
              clientName,
              type: RequestType.service,
              description: dto.description,
              status: RequestStatus.pending,
              serviceType: dto.serviceType,
              desiredDate: new Date(dto.desiredDate),
            },
          });
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
      // P2034 = serialization failure — transação concorrente ganhou a corrida
      const e = error as { code?: string };
      if (e.code === 'P2034') {
        throw new ForbiddenException(
          'Limite de serviços do mês atingido para o plano contratado.',
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
    });
    return requests.map(this.mapRequest);
  }

  async findByClientId(clientId: string): Promise<RequestResponseDto[]> {
    const requests = await this.prisma.request.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
    return requests.map(this.mapRequest);
  }

  async findById(id: string): Promise<RequestResponseDto | null> {
    const request = await this.prisma.request.findUnique({ where: { id } });
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
    });
    return this.mapRequest(updated);
  }

  private mapRequest(request: {
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
    desiredDate: Date | null;
    coverageType: string | null;
    estimatedLoss: { toString(): string } | null;
    approvedAmount: { toString(): string } | null;
    evidenceUrls: string[];
  }): RequestResponseDto {
    return {
      id: request.id,
      clientId: request.clientId,
      clientName: request.clientName,
      type: request.type,
      description: request.description,
      status: request.status,
      adminNotes: request.adminNotes,
      serviceType: request.serviceType,
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
