// Shim de compatibilidade — implementação em src/infrastructure/repositories/payment.repository.ts
export { paymentRepository as paymentsService } from "@/infrastructure/repositories/payment.repository";
export type {
  CreatePaymentInput,
  ListPaymentsOptions,
} from "@/domain/repositories/IPaymentRepository";
