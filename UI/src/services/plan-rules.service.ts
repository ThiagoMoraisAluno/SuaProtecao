// Shim de compatibilidade — implementação em src/infrastructure/repositories/plan-rule.repository.ts
export { planRuleRepository as planRulesService } from "@/infrastructure/repositories/plan-rule.repository";
export type { SetPlanRuleInput } from "@/domain/repositories/IPlanRuleRepository";
