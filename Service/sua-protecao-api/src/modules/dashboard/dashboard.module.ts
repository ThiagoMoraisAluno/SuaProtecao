import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './dashboard.repository';
import { DASHBOARD_REPOSITORY_TOKEN } from './interfaces/dashboard-repository.interface';

@Module({
  imports: [PrismaModule],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    { provide: DASHBOARD_REPOSITORY_TOKEN, useClass: DashboardRepository },
  ],
})
export class DashboardModule {}
