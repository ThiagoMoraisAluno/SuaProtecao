import { PaymentMethod } from '@prisma/client';

export interface AsaasCreateCustomerInput {
  name: string;
  cpfCnpj: string;
  email: string;
  phone?: string | null;
}

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
}

export interface AsaasCreatePaymentInput {
  customer: string;
  method: PaymentMethod;
  value: number;
  dueDate: string; // YYYY-MM-DD
  description: string;
  externalReference?: string;
  /** Apenas method = credit_card */
  installmentCount?: number;
  installmentValue?: number;
}

/** Resposta enxuta do Asaas — só os campos que persistimos */
export interface AsaasPayment {
  id: string;
  status: string;
  value: number;
  dueDate: string;
  invoiceUrl?: string | null;
  bankSlipUrl?: string | null;
  identificationField?: string | null;
  pixQrCode?: string | null;
  pixCopyAndPaste?: string | null;
  installment?: string | null;
  installmentCount?: number | null;
}

export interface AsaasPixData {
  payload: string;
  encodedImage: string;
}

export interface IAsaasClient {
  isConfigured(): boolean;
  createCustomer(input: AsaasCreateCustomerInput): Promise<AsaasCustomer>;
  createPayment(input: AsaasCreatePaymentInput): Promise<AsaasPayment>;
  getPayment(asaasPaymentId: string): Promise<AsaasPayment>;
  getPixData(asaasPaymentId: string): Promise<AsaasPixData | null>;
  deletePayment(asaasPaymentId: string): Promise<void>;
}

export const ASAAS_CLIENT_TOKEN = 'ASAAS_CLIENT';
