import api from "@/infrastructure/http/api";
import type { Payment, PaymentListResponse } from "@/domain/entities";
import type {
  IPaymentRepository,
  CreatePaymentInput,
  ListPaymentsOptions,
} from "@/domain/repositories/IPaymentRepository";

export const paymentRepository: IPaymentRepository = {
  async list(options: ListPaymentsOptions = {}): Promise<PaymentListResponse> {
    const { data } = await api.get<PaymentListResponse>("/payments", {
      params: {
        ...(options.limit !== undefined && { limit: options.limit }),
        ...(options.offset !== undefined && { offset: options.offset }),
        ...(options.status && { status: options.status }),
        ...(options.method && { method: options.method }),
      },
    });
    return data;
  },

  async findOne(id: string): Promise<Payment> {
    const { data } = await api.get<Payment>(`/payments/${id}`);
    return data;
  },

  async create(input: CreatePaymentInput): Promise<Payment> {
    const { data } = await api.post<Payment>("/payments", input);
    return data;
  },

  async cancel(id: string): Promise<Payment> {
    const { data } = await api.delete<Payment>(`/payments/${id}`);
    return data;
  },
};
