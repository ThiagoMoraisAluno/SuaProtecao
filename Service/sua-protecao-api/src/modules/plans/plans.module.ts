import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ServicesModule } from '../services/services.module';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { PlansRepository } from './plans.repository';
import { PLANS_REPOSITORY_TOKEN } from './interfaces/plans-repository.interface';
import { PlanRulesController } from './plan-rules.controller';
import { PlanRulesService } from './plan-rules.service';
import { PlanRulesRepository } from './plan-rules.repository';
import { PLAN_RULES_REPOSITORY_TOKEN } from './interfaces/plan-rules-repository.interface';

@Module({
  imports: [PrismaModule, ServicesModule],
  controllers: [PlansController, PlanRulesController],
  providers: [
    PlansService,
    { provide: PLANS_REPOSITORY_TOKEN, useClass: PlansRepository },
    PlanRulesService,
    { provide: PLAN_RULES_REPOSITORY_TOKEN, useClass: PlanRulesRepository },
  ],
  exports: [PlansService, PlanRulesService],
})
export class PlansModule {}
