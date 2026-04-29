export type PlanServiceRuleResponseDto = {
  id: string;
  planId: string;
  serviceId: string;
  serviceName: string;
  serviceSlug: string;
  serviceIcon: string | null;
  serviceIsActive: boolean;
  maxPerMonth: number;
  maxPerYear: number;
  coverageLimit: number;
  createdAt: Date;
  updatedAt: Date;
};
