import type { PlanServiceRule } from "@/domain/entities";

export type SetPlanRuleInput = {
  maxPerMonth: number;
  maxPerYear: number;
  coverageLimit: number;
};

export interface IPlanRuleRepository {
  findByPlan(planId: string): Promise<PlanServiceRule[]>;
  upsert(
    planId: string,
    serviceId: string,
    input: SetPlanRuleInput,
  ): Promise<PlanServiceRule>;
  remove(planId: string, serviceId: string): Promise<void>;
}
