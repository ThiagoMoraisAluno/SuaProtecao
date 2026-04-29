import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ServicesService } from '../services/services.service';
import {
  IPlansRepository,
  PLANS_REPOSITORY_TOKEN,
} from './interfaces/plans-repository.interface';
import {
  IPlanRulesRepository,
  PLAN_RULES_REPOSITORY_TOKEN,
  PlanRuleEnforcement,
} from './interfaces/plan-rules-repository.interface';
import { PlanServiceRuleResponseDto } from './dto/plan-rule-response.dto';
import { SetPlanRuleDto } from './dto/set-plan-rule.dto';

@Injectable()
export class PlanRulesService {
  constructor(
    @Inject(PLAN_RULES_REPOSITORY_TOKEN)
    private readonly plansRulesRepository: IPlanRulesRepository,
    @Inject(PLANS_REPOSITORY_TOKEN)
    private readonly plansRepository: IPlansRepository,
    private readonly servicesService: ServicesService,
  ) {}

  async findAllByPlan(planId: string): Promise<PlanServiceRuleResponseDto[]> {
    const plan = await this.plansRepository.findById(planId);
    if (!plan) throw new NotFoundException('Plano não encontrado.');
    return this.plansRulesRepository.findAllByPlan(planId);
  }

  async upsert(
    planId: string,
    serviceId: string,
    dto: SetPlanRuleDto,
  ): Promise<PlanServiceRuleResponseDto> {
    const plan = await this.plansRepository.findById(planId);
    if (!plan) throw new NotFoundException('Plano não encontrado.');
    await this.servicesService.findOne(serviceId);
    return this.plansRulesRepository.upsert(planId, serviceId, dto);
  }

  async remove(planId: string, serviceId: string): Promise<{ message: string }> {
    const removed = await this.plansRulesRepository.remove(planId, serviceId);
    if (!removed) {
      throw new NotFoundException('Regra não encontrada para este plano.');
    }
    return { message: 'Regra removida do plano.' };
  }

  findEnforcement(
    planId: string,
    serviceId: string,
  ): Promise<PlanRuleEnforcement | null> {
    return this.plansRulesRepository.findEnforcement(planId, serviceId);
  }
}
