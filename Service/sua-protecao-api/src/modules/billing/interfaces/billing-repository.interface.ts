export interface OverdueClientRow {
  clientId: string;
  clientUserId: string;
  clientName: string;
  supervisorUserId: string | null;
  supervisorName: string | null;
}

export interface IBillingRepository {
  /**
   * Retorna clientes ativos cujo "vencimento estimado" está atrasado em
   * mais que `gracePeriodDays`.
   *
   * Heurística (vigora até existir tabela Payment dedicada):
   *   reference = lastPaymentAt ?? joinedAt
   *   nextDueAt = reference + cycleDays(plan.billingCycle)
   *   atrasado se now > nextDueAt + gracePeriodDays
   *
   * cycleDays:
   *   - monthly → 30
   *   - annual  → 365
   */
  findOverdueClients(gracePeriodDays: number): Promise<OverdueClientRow[]>;
  markAsDefaulter(clientId: string): Promise<void>;
}

export const BILLING_REPOSITORY_TOKEN = 'BILLING_REPOSITORY';
