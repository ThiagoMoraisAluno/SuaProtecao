export interface OverdueClientRow {
  clientId: string;
  clientUserId: string;
  clientName: string;
  supervisorUserId: string | null;
  supervisorName: string | null;
}

export interface IBillingRepository {
  /**
   * Retorna clientes com pagamento em atraso. A consulta agora se baseia
   * na tabela `payments` (status overdue OU pending com dueDate vencido +
   * `gracePeriodDays`). Apenas clientes ainda marcados como `active` são
   * retornados — quem já é `defaulter` não precisa ser reprocessado.
   */
  findOverdueClients(gracePeriodDays: number): Promise<OverdueClientRow[]>;
  markAsDefaulter(clientId: string): Promise<void>;
}

export const BILLING_REPOSITORY_TOKEN = 'BILLING_REPOSITORY';
