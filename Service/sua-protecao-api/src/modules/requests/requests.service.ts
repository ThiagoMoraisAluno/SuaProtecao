import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ClientStatus,
  NotificationType,
  RequestStatus,
  RequestType,
} from '@prisma/client';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { CreateCoverageRequestDto } from './dto/create-coverage-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestResponseDto } from './dto/request-response.dto';
import {
  IRequestsRepository,
  REQUESTS_REPOSITORY_TOKEN,
} from './interfaces/requests-repository.interface';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { PlanRulesService } from '../plans/plan-rules.service';
import { ServicesService } from '../services/services.service';
import { NotificationsService } from '../notifications/notifications.service';

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
  private readonly logger = new Logger(RequestsService.name);

  constructor(
    @Inject(REQUESTS_REPOSITORY_TOKEN)
    private readonly requestsRepository: IRequestsRepository,
    private readonly planRulesService: PlanRulesService,
    private readonly servicesService: ServicesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createService(
    dto: CreateServiceRequestDto,
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

    const desired = new Date(dto.desiredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (desired < today) {
      throw new BadRequestException('A data desejada não pode ser no passado.');
    }

    const service = await this.servicesService.findOne(dto.serviceId);
    if (!service.isActive) {
      throw new BadRequestException(
        'Este serviço está temporariamente indisponível.',
      );
    }

    const rule = await this.planRulesService.findEnforcement(
      client.planId,
      dto.serviceId,
    );
    if (!rule) {
      throw new ForbiddenException('Serviço não coberto pelo seu plano.');
    }

    const clientName = client.user.profile?.username ?? '';

    const created = await this.requestsRepository.createServiceRequest(
      dto,
      client.id,
      clientName,
      {
        serviceId: rule.serviceId,
        maxPerMonth: rule.maxPerMonth,
        maxPerYear: rule.maxPerYear,
        coverageLimit: rule.coverageLimit,
      },
    );

    await this.dispatchRequestOpenedNotifications(
      created,
      client.id,
      client.supervisorId,
      clientName,
      service.name,
      client.supervisor?.user.profile?.username ?? null,
    );

    return created;
  }

  async createCoverage(
    dto: CreateCoverageRequestDto,
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

    const coverageLimit = client.plan.coverageLimit.toNumber();
    if (dto.estimatedLoss > coverageLimit) {
      throw new BadRequestException(
        `Valor estimado excede o limite de cobertura do plano (R$ ${coverageLimit.toFixed(2)}).`,
      );
    }

    // Limite anual: soma de coberturas já aprovadas no ano + valor estimado
    const usedThisYear =
      await this.requestsRepository.sumApprovedCoverageThisYear(client.id);
    if (usedThisYear + dto.estimatedLoss > coverageLimit) {
      const remaining = Math.max(0, coverageLimit - usedThisYear);
      throw new BadRequestException(
        `Limite anual de cobertura excedido. Já utilizado: R$ ${usedThisYear.toFixed(2)} ` +
          `de R$ ${coverageLimit.toFixed(2)}. Saldo disponível: R$ ${remaining.toFixed(2)}.`,
      );
    }

    const clientName = client.user.profile?.username ?? '';
    const created = await this.requestsRepository.createCoverageRequest(
      dto,
      client.id,
      clientName,
    );

    await this.dispatchRequestOpenedNotifications(
      created,
      client.id,
      client.supervisorId,
      clientName,
      'Cobertura',
      client.supervisor?.user.profile?.username ?? null,
    );

    return created;
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

  /**
   * Envia notificações ao Supervisor responsável, a todos os Masters/Admins
   * e ao próprio Cliente após a criação de um chamado.
   * Falhas no envio não bloqueiam o fluxo principal — apenas são logadas.
   */
  private async dispatchRequestOpenedNotifications(
    request: RequestResponseDto,
    clientUserId: string,
    supervisorUserId: string | null,
    clientName: string,
    serviceLabel: string,
    supervisorName: string | null,
  ): Promise<void> {
    const metadata = {
      requestId: request.id,
      clientId: clientUserId,
      type: request.type,
    };

    try {
      if (supervisorUserId) {
        await this.notificationsService.create({
          userId: supervisorUserId,
          type: NotificationType.request_opened,
          title: 'Novo chamado aberto',
          body: `O cliente ${clientName} abriu um chamado de ${serviceLabel}.`,
          metadata,
        });
      }

      await this.notificationsService.notifyAllAdmins({
        type: NotificationType.request_opened,
        title: `Novo chamado — ${serviceLabel}`,
        body: `Cliente ${clientName} (Supervisor: ${supervisorName ?? 'sem supervisor'}) abriu um chamado.`,
        metadata,
      });

      await this.notificationsService.create({
        userId: clientUserId,
        type: NotificationType.request_opened,
        title: 'Chamado aberto com sucesso',
        body: 'Seu chamado foi aberto com sucesso. Em até 24h um profissional será enviado. Em caso de urgência, entre em contato via WhatsApp.',
        metadata,
      });
    } catch (error) {
      this.logger.warn(
        `Falha ao enviar notificações do chamado ${request.id}: ${(error as Error).message}`,
      );
    }
  }
}
