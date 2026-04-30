import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientStatus,
  NotificationType,
  PaymentMethod,
  PaymentStatus,
} from '@prisma/client';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ListPaymentsDto } from './dto/list-payments.dto';
import {
  PaymentListResponseDto,
  PaymentResponseDto,
} from './dto/payment-response.dto';
import { AsaasWebhookDto } from './dto/asaas-webhook.dto';
import {
  IPaymentsRepository,
  PAYMENTS_REPOSITORY_TOKEN,
  PlanForPayment,
} from './interfaces/payments-repository.interface';
import {
  ASAAS_CLIENT_TOKEN,
  IAsaasClient,
} from './interfaces/asaas-client.interface';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { NotificationsService } from '../notifications/notifications.service';

const ANNUAL_INSTALLMENTS = 12;
const DEFAULT_DUE_IN_DAYS = 3;

/**
 * Mapeamento entre status do Asaas e nosso enum.
 * Eventos relevantes:
 *   PENDING / AWAITING_PAYMENT      → pending
 *   CONFIRMED / RECEIVED            → confirmed
 *   OVERDUE                         → overdue
 *   REFUNDED / REFUND_REQUESTED     → refunded
 *   DELETED / CANCELLED             → cancelled
 */
function mapAsaasStatus(asaasStatus: string): PaymentStatus | null {
  const normalized = asaasStatus.toUpperCase();
  if (normalized === 'CONFIRMED' || normalized === 'RECEIVED') {
    return PaymentStatus.confirmed;
  }
  if (normalized === 'OVERDUE') return PaymentStatus.overdue;
  if (normalized === 'REFUNDED' || normalized === 'REFUND_REQUESTED') {
    return PaymentStatus.refunded;
  }
  if (normalized === 'DELETED' || normalized === 'CANCELLED') {
    return PaymentStatus.cancelled;
  }
  if (normalized === 'PENDING' || normalized === 'AWAITING_PAYMENT') {
    return PaymentStatus.pending;
  }
  return null;
}

function statusFromEvent(event: string): PaymentStatus | null {
  switch (event) {
    case 'PAYMENT_CONFIRMED':
    case 'PAYMENT_RECEIVED':
      return PaymentStatus.confirmed;
    case 'PAYMENT_OVERDUE':
      return PaymentStatus.overdue;
    case 'PAYMENT_REFUNDED':
      return PaymentStatus.refunded;
    case 'PAYMENT_DELETED':
    case 'PAYMENT_CANCELLED':
      return PaymentStatus.cancelled;
    default:
      return null;
  }
}

function dueDateInDays(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function calculateAmount(plan: PlanForPayment): number {
  if (plan.billingCycle === 'monthly') return plan.price;
  const gross = plan.price * 12;
  const discount = plan.annualDiscount / 100;
  return Number((gross * (1 - discount)).toFixed(2));
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @Inject(PAYMENTS_REPOSITORY_TOKEN)
    private readonly paymentsRepository: IPaymentsRepository,
    @Inject(ASAAS_CLIENT_TOKEN)
    private readonly asaasClient: IAsaasClient,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  async create(
    dto: CreatePaymentDto,
    requester: JwtPayload,
  ): Promise<PaymentResponseDto> {
    if (!this.asaasClient.isConfigured()) {
      throw new ServiceUnavailableException(
        'Gateway de pagamento não configurado.',
      );
    }

    // Resolução do alvo: cliente sempre paga em nome próprio; admin/supervisor
    // pode emitir cobrança em nome de um clientId específico.
    const targetClientId =
      requester.role === 'client'
        ? requester.sub
        : (dto.clientId ?? requester.sub);

    const client = await this.paymentsRepository.findClient(targetClientId);
    if (!client) throw new NotFoundException('Cliente não encontrado.');

    if (
      requester.role === 'client' &&
      client.status === ClientStatus.inactive
    ) {
      throw new ForbiddenException('Conta inativa. Contate o suporte.');
    }

    const planId = dto.planId ?? client.planId;
    const plan = await this.paymentsRepository.findPlan(planId);
    if (!plan) throw new NotFoundException('Plano não encontrado.');

    if (
      dto.method === PaymentMethod.credit_card &&
      plan.billingCycle !== 'annual'
    ) {
      throw new BadRequestException(
        'Cartão de crédito disponível apenas em planos anuais.',
      );
    }

    const asaasCustomerId = await this.ensureAsaasCustomer(client);
    const amount = calculateAmount(plan);
    const dueDate = dueDateInDays(DEFAULT_DUE_IN_DAYS);
    const isInstalled =
      dto.method === PaymentMethod.credit_card &&
      plan.billingCycle === 'annual';

    let asaasPayment;
    try {
      asaasPayment = await this.asaasClient.createPayment({
        customer: asaasCustomerId,
        method: dto.method,
        value: isInstalled ? amount / ANNUAL_INSTALLMENTS : amount,
        dueDate: toIsoDate(dueDate),
        description: `${plan.name} — ${plan.billingCycle === 'annual' ? 'Anual' : 'Mensal'}`,
        externalReference: client.id,
        ...(isInstalled && {
          installmentCount: ANNUAL_INSTALLMENTS,
          installmentValue: Number(
            (amount / ANNUAL_INSTALLMENTS).toFixed(2),
          ),
        }),
      });
    } catch (error) {
      this.logger.error(
        `Falha ao criar pagamento no Asaas: ${(error as Error).message}`,
      );
      throw error;
    }

    // PIX: precisa de chamada extra para pegar QR
    let pixCode: string | null = null;
    let pixQrCode: string | null = null;
    if (dto.method === PaymentMethod.pix) {
      const pix = await this.asaasClient.getPixData(asaasPayment.id);
      if (pix) {
        pixCode = pix.payload;
        pixQrCode = pix.encodedImage;
      }
    }

    const created = await this.paymentsRepository.create({
      clientId: client.id,
      planId: plan.id,
      asaasPaymentId: asaasPayment.id,
      asaasCustomerId,
      method: dto.method,
      amount,
      dueDate,
      installment: isInstalled ? 1 : null,
      totalInstallments: isInstalled ? ANNUAL_INSTALLMENTS : null,
      pixCode,
      pixQrCode,
      boletoUrl:
        dto.method === PaymentMethod.boleto
          ? (asaasPayment.bankSlipUrl ?? null)
          : null,
      boletoBarCode:
        dto.method === PaymentMethod.boleto
          ? (asaasPayment.identificationField ?? null)
          : null,
      invoiceUrl: asaasPayment.invoiceUrl ?? null,
    });

    await this.notifyPaymentCreated(client.id, plan.name, dueDate);
    return created;
  }

  async list(
    requester: JwtPayload,
    query: ListPaymentsDto,
  ): Promise<PaymentListResponseDto> {
    return this.paymentsRepository.list({
      clientId: requester.role === 'client' ? requester.sub : undefined,
      status: query.status,
      method: query.method,
      limit: query.limit ?? 20,
      offset: query.offset ?? 0,
    });
  }

  async findOne(
    id: string,
    requester: JwtPayload,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentsRepository.findById(id);
    if (!payment) throw new NotFoundException('Pagamento não encontrado.');

    if (requester.role === 'client' && payment.clientId !== requester.sub) {
      throw new ForbiddenException('Acesso negado.');
    }
    return payment;
  }

  /**
   * Sincroniza status com Asaas (caso webhook tenha falhado) e retorna o
   * registro atualizado. Idempotente: se já está confirmado, retorna direto.
   */
  async refreshStatus(
    id: string,
    requester: JwtPayload,
  ): Promise<PaymentResponseDto> {
    const payment = await this.findOne(id, requester);
    if (
      payment.status === PaymentStatus.confirmed ||
      payment.status === PaymentStatus.cancelled ||
      payment.status === PaymentStatus.refunded
    ) {
      return payment;
    }
    if (!this.asaasClient.isConfigured()) return payment;

    try {
      const fresh = await this.asaasClient.getPayment(payment.asaasPaymentId);
      const next = mapAsaasStatus(fresh.status);
      if (!next || next === payment.status) return payment;

      const paidAt = next === PaymentStatus.confirmed ? new Date() : null;
      const updated = await this.paymentsRepository.updateStatus(
        payment.asaasPaymentId,
        next,
        paidAt,
      );
      if (updated && next === PaymentStatus.confirmed) {
        await this.applyConfirmedSideEffects(updated);
      }
      return updated ?? payment;
    } catch (error) {
      this.logger.warn(
        `Refresh status falhou para ${payment.asaasPaymentId}: ${(error as Error).message}`,
      );
      return payment;
    }
  }

  async cancel(id: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentsRepository.findById(id);
    if (!payment) throw new NotFoundException('Pagamento não encontrado.');

    if (
      payment.status === PaymentStatus.confirmed ||
      payment.status === PaymentStatus.refunded
    ) {
      throw new BadRequestException(
        'Pagamento já confirmado ou reembolsado não pode ser cancelado.',
      );
    }

    try {
      await this.asaasClient.deletePayment(payment.asaasPaymentId);
    } catch (error) {
      this.logger.warn(
        `Falha ao cancelar no Asaas (${payment.asaasPaymentId}): ${(error as Error).message}`,
      );
    }

    return this.paymentsRepository.cancel(id);
  }

  /**
   * Webhook do Asaas. Validação por header token (Asaas envia o `accessToken`
   * configurado no painel). Idempotente: se o status já é o desejado, ignora.
   */
  async handleWebhook(
    headerToken: string | undefined,
    body: AsaasWebhookDto,
  ): Promise<{ ok: true }> {
    const expected = this.configService.get<string>('ASAAS_WEBHOOK_TOKEN');
    if (expected && headerToken !== expected) {
      throw new UnauthorizedException('Token de webhook inválido.');
    }

    const next = statusFromEvent(body.event);
    if (!next) {
      this.logger.log(`Evento Asaas ignorado: ${body.event}`);
      return { ok: true };
    }

    const asaasPaymentId = (body.payment?.id as string | undefined) ?? null;
    if (!asaasPaymentId) {
      this.logger.warn('Webhook sem payment.id — ignorado.');
      return { ok: true };
    }

    const existing =
      await this.paymentsRepository.findByAsaasId(asaasPaymentId);
    if (!existing) {
      this.logger.warn(
        `Webhook para payment desconhecido (${asaasPaymentId}) — ignorado.`,
      );
      return { ok: true };
    }
    if (existing.status === next) {
      // Idempotência
      return { ok: true };
    }

    const paidAt = next === PaymentStatus.confirmed ? new Date() : null;
    const updated = await this.paymentsRepository.updateStatus(
      asaasPaymentId,
      next,
      paidAt,
    );
    if (!updated) return { ok: true };

    if (next === PaymentStatus.confirmed) {
      await this.applyConfirmedSideEffects(updated);
    } else if (next === PaymentStatus.overdue) {
      await this.applyOverdueSideEffects(updated);
    }

    return { ok: true };
  }

  // ─── Helpers internos ─────────────────────────────────────────────────────

  private async ensureAsaasCustomer(client: {
    id: string;
    cpf: string;
    phone: string | null;
    asaasCustomerId: string | null;
    email: string;
    name: string;
  }): Promise<string> {
    if (client.asaasCustomerId) return client.asaasCustomerId;
    const customer = await this.asaasClient.createCustomer({
      name: client.name,
      cpfCnpj: client.cpf,
      email: client.email,
      phone: client.phone,
    });
    await this.paymentsRepository.setAsaasCustomerId(client.id, customer.id);
    return customer.id;
  }

  private async applyConfirmedSideEffects(
    payment: PaymentResponseDto,
  ): Promise<void> {
    await this.paymentsRepository.markClientActiveAfterPayment(
      payment.clientId,
      payment.paidAt ?? new Date(),
    );

    try {
      await this.notificationsService.create({
        userId: payment.clientId,
        type: NotificationType.payment_confirmed,
        title: 'Pagamento confirmado',
        body: `Seu pagamento de ${formatCurrency(payment.amount)} (${payment.planName ?? 'Plano'}) foi confirmado. Plano ativo!`,
        metadata: { paymentId: payment.id },
      });
    } catch (error) {
      this.logger.warn(
        `Falha ao notificar confirmação: ${(error as Error).message}`,
      );
    }
  }

  private async applyOverdueSideEffects(
    payment: PaymentResponseDto,
  ): Promise<void> {
    await this.paymentsRepository.markClientDefaulter(payment.clientId);

    try {
      await this.notificationsService.create({
        userId: payment.clientId,
        type: NotificationType.payment_overdue,
        title: 'Pagamento em atraso',
        body: `Sua cobrança de ${formatCurrency(payment.amount)} venceu. Regularize para reativar seu plano.`,
        metadata: { paymentId: payment.id },
      });
      await this.notificationsService.notifyAllAdmins({
        type: NotificationType.payment_overdue,
        title: 'Cliente em atraso',
        body: `Cobrança vencida: ${payment.clientName ?? 'cliente'} — ${formatCurrency(payment.amount)}.`,
        metadata: { paymentId: payment.id, clientId: payment.clientId },
      });
    } catch (error) {
      this.logger.warn(
        `Falha ao notificar overdue: ${(error as Error).message}`,
      );
    }
  }

  private async notifyPaymentCreated(
    clientUserId: string,
    planName: string,
    dueDate: Date,
  ): Promise<void> {
    try {
      await this.notificationsService.create({
        userId: clientUserId,
        type: NotificationType.payment_overdue, // reaproveita o tipo "billing"
        title: 'Cobrança gerada',
        body: `Sua cobrança do ${planName} foi gerada. Vencimento: ${dueDate.toLocaleDateString('pt-BR')}.`,
      });
    } catch (error) {
      this.logger.warn(
        `Falha ao notificar geração: ${(error as Error).message}`,
      );
    }
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
