import { Injectable } from '@nestjs/common';
import {
  ClientStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ClientForPayment,
  CreatePaymentRecordInput,
  IPaymentsRepository,
  ListPaymentsFilter,
  PlanForPayment,
} from './interfaces/payments-repository.interface';
import {
  PaymentListResponseDto,
  PaymentResponseDto,
} from './dto/payment-response.dto';

type PrismaPayment = {
  id: string;
  clientId: string;
  planId: string;
  asaasPaymentId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: { toString(): string };
  dueDate: Date;
  paidAt: Date | null;
  installment: number | null;
  totalInstallments: number | null;
  pixCode: string | null;
  pixQrCode: string | null;
  boletoUrl: string | null;
  boletoBarCode: string | null;
  invoiceUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  client?: { user: { profile: { username: string } | null } } | null;
  plan?: { name: string } | null;
};

@Injectable()
export class PaymentsRepository implements IPaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findClient(clientId: string): Promise<ClientForPayment | null> {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: { user: { include: { profile: true } } },
    });
    if (!client) return null;
    return {
      id: client.id,
      cpf: client.cpf,
      phone: client.phone,
      status: client.status,
      asaasCustomerId: client.asaasCustomerId,
      planId: client.planId,
      email: client.user.email,
      name: client.user.profile?.username ?? '',
    };
  }

  async findPlan(planId: string): Promise<PlanForPayment | null> {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) return null;
    return {
      id: plan.id,
      name: plan.name,
      price: Number(plan.price),
      billingCycle: plan.billingCycle,
      annualDiscount: Number(plan.annualDiscount),
    };
  }

  async setAsaasCustomerId(
    clientId: string,
    asaasCustomerId: string,
  ): Promise<void> {
    await this.prisma.client.update({
      where: { id: clientId },
      data: { asaasCustomerId },
    });
  }

  async create(input: CreatePaymentRecordInput): Promise<PaymentResponseDto> {
    const created = await this.prisma.payment.create({
      data: {
        clientId: input.clientId,
        planId: input.planId,
        asaasPaymentId: input.asaasPaymentId,
        asaasCustomerId: input.asaasCustomerId,
        method: input.method,
        amount: input.amount,
        dueDate: input.dueDate,
        ...(input.installment !== undefined && {
          installment: input.installment,
        }),
        ...(input.totalInstallments !== undefined && {
          totalInstallments: input.totalInstallments,
        }),
        ...(input.pixCode !== undefined && { pixCode: input.pixCode }),
        ...(input.pixQrCode !== undefined && { pixQrCode: input.pixQrCode }),
        ...(input.boletoUrl !== undefined && { boletoUrl: input.boletoUrl }),
        ...(input.boletoBarCode !== undefined && {
          boletoBarCode: input.boletoBarCode,
        }),
        ...(input.invoiceUrl !== undefined && { invoiceUrl: input.invoiceUrl }),
      },
      include: {
        client: { include: { user: { include: { profile: true } } } },
        plan: { select: { name: true } },
      },
    });
    return this.map(created);
  }

  async findById(id: string): Promise<PaymentResponseDto | null> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        client: { include: { user: { include: { profile: true } } } },
        plan: { select: { name: true } },
      },
    });
    return payment ? this.map(payment) : null;
  }

  async findByAsaasId(
    asaasPaymentId: string,
  ): Promise<PaymentResponseDto | null> {
    const payment = await this.prisma.payment.findUnique({
      where: { asaasPaymentId },
      include: {
        client: { include: { user: { include: { profile: true } } } },
        plan: { select: { name: true } },
      },
    });
    return payment ? this.map(payment) : null;
  }

  async list(filter: ListPaymentsFilter): Promise<PaymentListResponseDto> {
    const where: Prisma.PaymentWhereInput = {
      ...(filter.clientId && { clientId: filter.clientId }),
      ...(filter.status && { status: filter.status }),
      ...(filter.method && { method: filter.method }),
    };
    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filter.limit,
        skip: filter.offset,
        include: {
          client: { include: { user: { include: { profile: true } } } },
          plan: { select: { name: true } },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);
    return {
      items: items.map((p) => this.map(p)),
      total,
    };
  }

  async updateStatus(
    asaasPaymentId: string,
    status: PaymentStatus,
    paidAt: Date | null,
  ): Promise<PaymentResponseDto | null> {
    try {
      const updated = await this.prisma.payment.update({
        where: { asaasPaymentId },
        data: {
          status,
          paidAt,
        },
        include: {
          client: { include: { user: { include: { profile: true } } } },
          plan: { select: { name: true } },
        },
      });
      return this.map(updated);
    } catch (error) {
      const e = error as { code?: string };
      if (e.code === 'P2025') return null;
      throw error;
    }
  }

  async cancel(id: string): Promise<PaymentResponseDto> {
    const updated = await this.prisma.payment.update({
      where: { id },
      data: { status: PaymentStatus.cancelled },
      include: {
        client: { include: { user: { include: { profile: true } } } },
        plan: { select: { name: true } },
      },
    });
    return this.map(updated);
  }

  async markClientActiveAfterPayment(
    clientId: string,
    paidAt: Date,
  ): Promise<void> {
    await this.prisma.client.update({
      where: { id: clientId },
      data: {
        status: ClientStatus.active,
        lastPaymentAt: paidAt,
      },
    });
  }

  async markClientDefaulter(clientId: string): Promise<void> {
    await this.prisma.client.update({
      where: { id: clientId },
      data: { status: ClientStatus.defaulter },
    });
  }

  private map(payment: PrismaPayment): PaymentResponseDto {
    return {
      id: payment.id,
      clientId: payment.clientId,
      clientName: payment.client?.user.profile?.username ?? null,
      planId: payment.planId,
      planName: payment.plan?.name ?? null,
      asaasPaymentId: payment.asaasPaymentId,
      method: payment.method,
      status: payment.status,
      amount: Number(payment.amount),
      dueDate: payment.dueDate,
      paidAt: payment.paidAt,
      installment: payment.installment,
      totalInstallments: payment.totalInstallments,
      pixCode: payment.pixCode,
      pixQrCode: payment.pixQrCode,
      boletoUrl: payment.boletoUrl,
      boletoBarCode: payment.boletoBarCode,
      invoiceUrl: payment.invoiceUrl,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
