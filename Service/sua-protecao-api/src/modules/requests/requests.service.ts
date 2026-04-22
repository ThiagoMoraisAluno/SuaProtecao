import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ClientStatus, RequestStatus, RequestType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { CreateCoverageRequestDto } from './dto/create-coverage-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

type CreateRequestDto = CreateServiceRequestDto | CreateCoverageRequestDto;

const SERVICE_VALID_TRANSITIONS: Record<string, RequestStatus[]> = {
  [RequestStatus.pending]: [RequestStatus.in_progress],
  [RequestStatus.in_progress]: [RequestStatus.completed],
  [RequestStatus.completed]: [],
};

const COVERAGE_VALID_TRANSITIONS: Record<string, RequestStatus[]> = {
  [RequestStatus.analyzing]: [RequestStatus.approved, RequestStatus.denied],
  [RequestStatus.approved]: [],
  [RequestStatus.denied]: [],
};

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRequestDto, requester: JwtPayload) {
    const client = await this.prisma.client.findUnique({
      where: { id: requester.sub },
      include: { plan: true, user: { include: { profile: true } } },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    if (client.status === ClientStatus.defaulter) {
      throw new ForbiddenException(
        'Clientes inadimplentes não podem abrir chamados.',
      );
    }

    if ('serviceType' in dto) {
      return this.createServiceRequest(dto, client);
    } else {
      return this.createCoverageRequest(dto, client);
    }
  }

  private async createServiceRequest(
    dto: CreateServiceRequestDto,
    client: {
      id: string;
      servicesUsedThisMonth: number;
      plan: { servicesPerMonth: number };
      user: { profile: { username: string } | null };
    },
  ) {
    // Validate desiredDate is not in the past
    const desired = new Date(dto.desiredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (desired < today) {
      throw new BadRequestException(
        'A data desejada não pode ser no passado.',
      );
    }

    // Validate service limit
    const { servicesPerMonth } = client.plan;
    if (
      servicesPerMonth !== -1 &&
      client.servicesUsedThisMonth >= servicesPerMonth
    ) {
      throw new ForbiddenException(
        'Limite de serviços do mês atingido para o plano contratado.',
      );
    }

    const clientName = client.user.profile?.username ?? '';

    const request = await this.prisma.$transaction(async (tx) => {
      const newRequest = await tx.request.create({
        data: {
          clientId: client.id,
          clientName,
          type: RequestType.service,
          description: dto.description,
          status: RequestStatus.pending,
          serviceType: dto.serviceType,
          desiredDate: new Date(dto.desiredDate),
        },
      });

      await tx.client.update({
        where: { id: client.id },
        data: { servicesUsedThisMonth: { increment: 1 } },
      });

      return newRequest;
    });

    return this.mapRequest(request);
  }

  private async createCoverageRequest(
    dto: CreateCoverageRequestDto,
    client: {
      id: string;
      user: { profile: { username: string } | null };
    },
  ) {
    const clientName = client.user.profile?.username ?? '';

    const request = await this.prisma.request.create({
      data: {
        clientId: client.id,
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

  async findAll(requester: JwtPayload) {
    if (requester.role === 'client') {
      return this.findMy(requester.sub);
    }

    const requests = await this.prisma.request.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r) => this.mapRequest(r));
  }

  async findMy(clientId: string) {
    const requests = await this.prisma.request.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r) => this.mapRequest(r));
  }

  async findOne(id: string, requester: JwtPayload) {
    const request = await this.prisma.request.findUnique({ where: { id } });
    if (!request) {
      throw new NotFoundException('Chamado não encontrado.');
    }

    if (requester.role === 'client' && request.clientId !== requester.sub) {
      throw new ForbiddenException('Acesso negado.');
    }

    return this.mapRequest(request);
  }

  async update(id: string, dto: UpdateRequestDto) {
    const request = await this.prisma.request.findUnique({ where: { id } });
    if (!request) {
      throw new NotFoundException('Chamado não encontrado.');
    }

    // Validate status transitions
    if (dto.status && dto.status !== request.status) {
      const transitions =
        request.type === RequestType.service
          ? SERVICE_VALID_TRANSITIONS
          : COVERAGE_VALID_TRANSITIONS;

      const allowed = transitions[request.status] ?? [];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(
          `Transição de status inválida: ${request.status} → ${dto.status}`,
        );
      }
    }

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
  }) {
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
      estimatedLoss: request.estimatedLoss
        ? Number(request.estimatedLoss)
        : null,
      approvedAmount: request.approvedAmount
        ? Number(request.approvedAmount)
        : null,
      evidenceUrls: request.evidenceUrls,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }
}
