import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { BillingService } from './billing.service';
import { BillingRepository } from './billing.repository';
import { BillingCron } from './billing.cron';
import { BILLING_REPOSITORY_TOKEN } from './interfaces/billing-repository.interface';

@Module({
  imports: [PrismaModule, NotificationsModule],
  providers: [
    BillingService,
    BillingCron,
    { provide: BILLING_REPOSITORY_TOKEN, useClass: BillingRepository },
  ],
  exports: [BillingService],
})
export class BillingModule {}
