import api from "@/infrastructure/http/api";
import type { PlanServiceRule } from "@/domain/entities";
import type {
  IPlanRuleRepository,
  SetPlanRuleInput,
} from "@/domain/repositories/IPlanRuleRepository";

export const planRuleRepository: IPlanRuleRepository = {
  async findByPlan(planId: string): Promise<PlanServiceRule[]> {
    const { data } = await api.get<PlanServiceRule[]>(
      `/plans/${planId}/service-rules`,
    );
    return data;
  },

  async upsert(
    planId: string,
    serviceId: string,
    input: SetPlanRuleInput,
  ): Promise<PlanServiceRule> {
    const { data } = await api.put<PlanServiceRule>(
      `/plans/${planId}/service-rules/${serviceId}`,
      input,
    );
    return data;
  },

  async remove(planId: string, serviceId: string): Promise<void> {
    await api.delete(`/plans/${planId}/service-rules/${serviceId}`);
  },
};
