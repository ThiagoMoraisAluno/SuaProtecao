import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BillingService } from './billing.service';

@Injectable()
export class BillingCron {
  private readonly logger = new Logger(BillingCron.name);

  constructor(private readonly billingService: BillingService) {}

  /** Executa todo dia à meia-noite (server time). */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { name: 'defaulter-check' })
  async handleDefaulterCheck(): Promise<void> {
    try {
      const { flagged } = await this.billingService.runDefaulterCheck();
      this.logger.log(
        `[cron defaulter-check] processados: ${flagged} cliente(s).`,
      );
    } catch (error) {
      this.logger.error(
        `[cron defaulter-check] erro: ${(error as Error).message}`,
      );
    }
  }
}
