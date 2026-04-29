import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './notifications.repository';
import { NOTIFICATIONS_REPOSITORY_TOKEN } from './interfaces/notifications-repository.interface';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    {
      provide: NOTIFICATIONS_REPOSITORY_TOKEN,
      useClass: NotificationsRepository,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
