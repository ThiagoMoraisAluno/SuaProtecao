import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ServicesModule } from '../services/services.module';
import { PlansModule } from '../plans/plans.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { RequestsRepository } from './requests.repository';
import { REQUESTS_REPOSITORY_TOKEN } from './interfaces/requests-repository.interface';

@Module({
  imports: [PrismaModule, ServicesModule, PlansModule, NotificationsModule],
  controllers: [RequestsController],
  providers: [
    RequestsService,
    { provide: REQUESTS_REPOSITORY_TOKEN, useClass: RequestsRepository },
  ],
  exports: [RequestsService],
})
export class RequestsModule {}
