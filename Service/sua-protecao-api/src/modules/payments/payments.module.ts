import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './payments.repository';
import { AsaasClient } from './infra/asaas.client';
import { PAYMENTS_REPOSITORY_TOKEN } from './interfaces/payments-repository.interface';
import { ASAAS_CLIENT_TOKEN } from './interfaces/asaas-client.interface';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    { provide: PAYMENTS_REPOSITORY_TOKEN, useClass: PaymentsRepository },
    { provide: ASAAS_CLIENT_TOKEN, useClass: AsaasClient },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
