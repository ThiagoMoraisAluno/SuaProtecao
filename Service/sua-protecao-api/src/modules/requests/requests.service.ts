import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientStatus, RequestStatus, RequestType } from '@prisma/client';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { CreateCoverageRequestDto } from './dto/create-coverage-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestResponseDto } from './dto/request-response.dto';
import {
  IRequestsRepository,
  REQUESTS_REPOSITORY_TOKEN,
} from './interfaces/requests-repository.interface';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

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

type CreateRequestDto = CreateServiceRequestDto | CreateCoverageRequestDto;

@Injectable()
export class RequestsService {
  constructor(
    @Inject(REQUESTS_REPOSITORY_TOKEN)
    private readonly requestsRepository: IRequestsRepository,
  ) {}

  async create(
    dto: CreateRequestDto,
    requester: JwtPayload,
  ): Promise<RequestResponseDto> {
    const client = await this.requestsRepository.findClientForRequest(
      requester.sub,
    );
    if (!client) throw new NotFoundException('Cliente não encontrado.');

    if (client.status === ClientStatus.defaulter) {
      throw new ForbiddenException(
        'Clientes inadimplentes não podem abrir chamados.',
      );
    }

    const clientName = client.user.profile?.username ?? '';

    if ('serviceType' in dto) {
      const desired = new Date(dto.desiredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (desired < today) {
        throw new BadRequestException('A data desejada não pode ser no passado.');
      }

      const { servicesPerMonth } = client.plan;
      if (
        servicesPerMonth !== -1 &&
        client.servicesUsedThisMonth >= servicesPerMonth
      ) {
        throw new ForbiddenException(
          'Limite de serviços do mês atingido para o plano contratado.',
        );
      }

      return this.requestsRepository.createServiceRequest(
        dto,
        client.id,
        clientName,
      );
    }

    return this.requestsRepository.createCoverageRequest(
      dto as CreateCoverageRequestDto,
      client.id,
      clientName,
    );
  }

  async findAll(requester: JwtPayload): Promise<RequestResponseDto[]> {
    if (requester.role === 'client') {
      return this.requestsRepository.findByClientId(requester.sub);
    }
    return this.requestsRepository.findAll();
  }

  async findMy(clientId: string): Promise<RequestResponseDto[]> {
    return this.requestsRepository.findByClientId(clientId);
  }

  async findOne(id: string, requester: JwtPayload): Promise<RequestResponseDto> {
    const record = await this.requestsRepository.findRecordById(id);
    if (!record) throw new NotFoundException('Chamado não encontrado.');

    if (requester.role === 'client' && record.clientId !== requester.sub) {
      throw new ForbiddenException('Acesso negado.');
    }

    return (await this.requestsRepository.findById(id))!;
  }

  async update(id: string, dto: UpdateRequestDto): Promise<RequestResponseDto> {
    const record = await this.requestsRepository.findRecordById(id);
    if (!record) throw new NotFoundException('Chamado não encontrado.');

    if (dto.status && dto.status !== record.status) {
      const transitions =
        record.type === RequestType.service
          ? SERVICE_VALID_TRANSITIONS
          : COVERAGE_VALID_TRANSITIONS;

      const allowed = transitions[record.status] ?? [];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(
          `Transição de status inválida: ${record.status} → ${dto.status}`,
        );
      }
    }

    return this.requestsRepository.update(id, dto);
  }
}
