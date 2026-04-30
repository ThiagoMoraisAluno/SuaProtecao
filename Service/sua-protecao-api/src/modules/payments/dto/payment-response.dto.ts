import { PaymentMethod, PaymentStatus } from '@prisma/client';

export type PaymentResponseDto = {
  id: string;
  clientId: string;
  clientName: string | null;
  planId: string;
  planName: string | null;
  asaasPaymentId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
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
};

export type PaymentListResponseDto = {
  items: PaymentResponseDto[];
  total: number;
};
