import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationType } from '@prisma/client';
import {
  BILLING_REPOSITORY_TOKEN,
  IBillingRepository,
} from './interfaces/billing-repository.interface';
import { NotificationsService } from '../notifications/notifications.service';

const DEFAULT_GRACE_PERIOD_DAYS = 5;

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @Inject(BILLING_REPOSITORY_TOKEN)
    private readonly billingRepository: IBillingRepository,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Detecta clientes ativos com pagamento em atraso > graceDays e:
   *   1. Marca status como `defaulter`
   *   2. Notifica o supervisor responsável
   *   3. Notifica todos os admins (Master)
   *
   * Retorna o número de clientes processados.
   */
  async runDefaulterCheck(): Promise<{ flagged: number }> {
    const graceDays = this.getGracePeriodDays();
    const overdue =
      await this.billingRepository.findOverdueClients(graceDays);

    if (overdue.length === 0) {
      this.logger.log(`Nenhum cliente em atraso (grace=${graceDays}d).`);
      return { flagged: 0 };
    }

    this.logger.log(
      `Encontrados ${overdue.length} cliente(s) em atraso (>${graceDays}d). Bloqueando…`,
    );

    for (const client of overdue) {
      try {
        await this.billingRepository.markAsDefaulter(client.clientId);

        const metadata = { clientId: client.clientId };

        if (client.supervisorUserId) {
          await this.notificationsService.create({
            userId: client.supervisorUserId,
            type: NotificationType.payment_overdue,
            title: 'Cliente inadimplente',
            body: `O cliente ${client.clientName} está com pagamento em atraso há mais de ${graceDays} dias.`,
            metadata,
          });
        }

        await this.notificationsService.notifyAllAdmins({
          type: NotificationType.payment_overdue,
          title: 'Cliente bloqueado por inadimplência',
          body: `${client.clientName} (Supervisor: ${client.supervisorName ?? 'sem supervisor'}) foi marcado como inadimplente.`,
          metadata,
        });
      } catch (error) {
        this.logger.warn(
          `Falha ao processar cliente ${client.clientId}: ${(error as Error).message}`,
        );
      }
    }

    return { flagged: overdue.length };
  }

  private getGracePeriodDays(): number {
    const raw = this.configService.get<string>('DEFAULTER_GRACE_DAYS');
    const parsed = raw ? parseInt(raw, 10) : DEFAULT_GRACE_PERIOD_DAYS;
    return Number.isFinite(parsed) && parsed > 0
      ? parsed
      : DEFAULT_GRACE_PERIOD_DAYS;
  }
}
