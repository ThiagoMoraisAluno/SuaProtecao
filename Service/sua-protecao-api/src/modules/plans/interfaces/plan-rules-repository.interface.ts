import { PlanServiceRuleResponseDto } from '../dto/plan-rule-response.dto';
import { SetPlanRuleDto } from '../dto/set-plan-rule.dto';

export interface PlanRuleEnforcement {
  planId: string;
  serviceId: string;
  maxPerMonth: number;
  maxPerYear: number;
  coverageLimit: number;
}

export interface IPlanRulesRepository {
  findAllByPlan(planId: string): Promise<PlanServiceRuleResponseDto[]>;
  findOne(
    planId: string,
    serviceId: string,
  ): Promise<PlanServiceRuleResponseDto | null>;
  upsert(
    planId: string,
    serviceId: string,
    dto: SetPlanRuleDto,
  ): Promise<PlanServiceRuleResponseDto>;
  remove(planId: string, serviceId: string): Promise<boolean>;
  findEnforcement(
    planId: string,
    serviceId: string,
  ): Promise<PlanRuleEnforcement | null>;
}

export const PLAN_RULES_REPOSITORY_TOKEN = 'PLAN_RULES_REPOSITORY';
