import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentMethod } from '@prisma/client';
import {
  AsaasCreateCustomerInput,
  AsaasCreatePaymentInput,
  AsaasCustomer,
  AsaasPayment,
  AsaasPixData,
  IAsaasClient,
} from '../interfaces/asaas-client.interface';

const ASAAS_BILLING_TYPE: Record<PaymentMethod, string> = {
  pix: 'PIX',
  boleto: 'BOLETO',
  credit_card: 'CREDIT_CARD',
};

interface AsaasErrorResponse {
  errors?: Array<{ description: string; code?: string }>;
}

interface AsaasPaymentResponse {
  id: string;
  status: string;
  value: number;
  dueDate: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  identificationField?: string;
  installment?: string;
  installmentCount?: number;
}

interface AsaasPixResponse {
  payload: string;
  encodedImage: string;
}

interface AsaasCustomerResponse {
  id: string;
  name: string;
  email: string;
}

@Injectable()
export class AsaasClient implements IAsaasClient {
  private readonly logger = new Logger(AsaasClient.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('ASAAS_BASE_URL') ??
      'https://sandbox.asaas.com/api/v3';
    this.apiKey = this.configService.get<string>('ASAAS_API_KEY') ?? '';
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async createCustomer(
    input: AsaasCreateCustomerInput,
  ): Promise<AsaasCustomer> {
    const payload = {
      name: input.name,
      cpfCnpj: input.cpfCnpj,
      email: input.email,
      ...(input.phone ? { mobilePhone: input.phone } : {}),
    };
    const data = await this.request<AsaasCustomerResponse>(
      'POST',
      '/customers',
      payload,
    );
    return { id: data.id, name: data.name, email: data.email };
  }

  async createPayment(
    input: AsaasCreatePaymentInput,
  ): Promise<AsaasPayment> {
    const billingType = ASAAS_BILLING_TYPE[input.method];
    const payload: Record<string, unknown> = {
      customer: input.customer,
      billingType,
      value: input.value,
      dueDate: input.dueDate,
      description: input.description,
    };
    if (input.externalReference) {
      payload.externalReference = input.externalReference;
    }
    // Asaas suporta criação de "installmentPlan" com mais de uma parcela:
    // installmentCount + installmentValue (valor por parcela)
    if (input.installmentCount && input.installmentCount > 1) {
      payload.installmentCount = input.installmentCount;
      payload.installmentValue =
        input.installmentValue ?? input.value / input.installmentCount;
    }

    const data = await this.request<AsaasPaymentResponse>(
      'POST',
      '/payments',
      payload,
    );

    return this.mapPayment(data);
  }

  async getPayment(asaasPaymentId: string): Promise<AsaasPayment> {
    const data = await this.request<AsaasPaymentResponse>(
      'GET',
      `/payments/${asaasPaymentId}`,
    );
    return this.mapPayment(data);
  }

  async getPixData(asaasPaymentId: string): Promise<AsaasPixData | null> {
    try {
      const data = await this.request<AsaasPixResponse>(
        'GET',
        `/payments/${asaasPaymentId}/pixQrCode`,
      );
      return { payload: data.payload, encodedImage: data.encodedImage };
    } catch (error) {
      this.logger.warn(
        `Falha ao buscar dados PIX (${asaasPaymentId}): ${(error as Error).message}`,
      );
      return null;
    }
  }

  async deletePayment(asaasPaymentId: string): Promise<void> {
    await this.request<void>('DELETE', `/payments/${asaasPaymentId}`);
  }

  private mapPayment(data: AsaasPaymentResponse): AsaasPayment {
    return {
      id: data.id,
      status: data.status,
      value: data.value,
      dueDate: data.dueDate,
      invoiceUrl: data.invoiceUrl ?? null,
      bankSlipUrl: data.bankSlipUrl ?? null,
      identificationField: data.identificationField ?? null,
      installment: data.installment ?? null,
      installmentCount: data.installmentCount ?? null,
    };
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'DELETE',
    path: string,
    body?: unknown,
  ): Promise<T> {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(
        'Gateway de pagamento não configurado (ASAAS_API_KEY ausente).',
      );
    }

    const url = `${this.baseUrl}${path}`;
    const init: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        access_token: this.apiKey,
      },
      ...(body !== undefined && { body: JSON.stringify(body) }),
    };

    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (error) {
      this.logger.error(
        `Falha de rede no Asaas (${method} ${path}): ${(error as Error).message}`,
      );
      throw new ServiceUnavailableException(
        'Não foi possível contatar o gateway de pagamento.',
      );
    }

    if (response.status === 204 || method === 'DELETE') {
      return undefined as T;
    }

    const text = await response.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      const errorPayload = data as AsaasErrorResponse;
      const message =
        errorPayload?.errors?.[0]?.description ??
        `Asaas respondeu ${response.status}`;
      this.logger.error(`Asaas ${method} ${path} → ${response.status}: ${message}`);
      throw new ServiceUnavailableException(`Gateway: ${message}`);
    }

    return data as T;
  }
}
