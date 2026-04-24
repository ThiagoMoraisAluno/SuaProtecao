import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { PlansRepository } from './plans.repository';
import { PLANS_REPOSITORY_TOKEN } from './interfaces/plans-repository.interface';

@Module({
  imports: [PrismaModule],
  controllers: [PlansController],
  providers: [
    PlansService,
    { provide: PLANS_REPOSITORY_TOKEN, useClass: PlansRepository },
  ],
  exports: [PlansService],
})
export class PlansModule {}
