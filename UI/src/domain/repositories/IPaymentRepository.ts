import type {
  Payment,
  PaymentListResponse,
  PaymentMethod,
  PaymentStatus,
} from "@/domain/entities";

export interface CreatePaymentInput {
  method: PaymentMethod;
  planId?: string;
  clientId?: string;
}

export interface ListPaymentsOptions {
  limit?: number;
  offset?: number;
  status?: PaymentStatus;
  method?: PaymentMethod;
}

export interface IPaymentRepository {
  list(options?: ListPaymentsOptions): Promise<PaymentListResponse>;
  findOne(id: string): Promise<Payment>;
  create(input: CreatePaymentInput): Promise<Payment>;
  cancel(id: string): Promise<Payment>;
}
