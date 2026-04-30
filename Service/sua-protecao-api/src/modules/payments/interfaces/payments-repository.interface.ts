import {
  ClientStatus,
  PaymentMethod,
  PaymentStatus,
} from '@prisma/client';
import {
  PaymentListResponseDto,
  PaymentResponseDto,
} from '../dto/payment-response.dto';

export interface ClientForPayment {
  id: string;
  cpf: string;
  phone: string | null;
  status: ClientStatus;
  asaasCustomerId: string | null;
  planId: string;
  email: string;
  name: string;
}

export interface PlanForPayment {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'annual';
  annualDiscount: number;
}

export interface CreatePaymentRecordInput {
  clientId: string;
  planId: string;
  asaasPaymentId: string;
  asaasCustomerId: string;
  method: PaymentMethod;
  amount: number;
  dueDate: Date;
  installment?: number | null;
  totalInstallments?: number | null;
  pixCode?: string | null;
  pixQrCode?: string | null;
  boletoUrl?: string | null;
  boletoBarCode?: string | null;
  invoiceUrl?: string | null;
}

export interface ListPaymentsFilter {
  clientId?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  limit: number;
  offset: number;
}

export interface IPaymentsRepository {
  findClient(clientId: string): Promise<ClientForPayment | null>;
  findPlan(planId: string): Promise<PlanForPayment | null>;
  setAsaasCustomerId(clientId: string, asaasCustomerId: string): Promise<void>;
  create(input: CreatePaymentRecordInput): Promise<PaymentResponseDto>;
  findById(id: string): Promise<PaymentResponseDto | null>;
  findByAsaasId(asaasPaymentId: string): Promise<PaymentResponseDto | null>;
  list(filter: ListPaymentsFilter): Promise<PaymentListResponseDto>;
  updateStatus(
    asaasPaymentId: string,
    status: PaymentStatus,
    paidAt: Date | null,
  ): Promise<PaymentResponseDto | null>;
  cancel(id: string): Promise<PaymentResponseDto>;
  /** Atualiza Client.status + Client.lastPaymentAt de forma atômica */
  markClientActiveAfterPayment(
    clientId: string,
    paidAt: Date,
  ): Promise<void>;
  markClientDefaulter(clientId: string): Promise<void>;
}

export const PAYMENTS_REPOSITORY_TOKEN = 'PAYMENTS_REPOSITORY';
