import { BillingCycle } from '@prisma/client';

export type PlanResponseDto = {
  id: string;
  type: string;
  name: string;
  price: number;
  servicesPerMonth: number;
  coverageLimit: number;
  features: string[];
  color: string;
  popular: boolean;
  billingCycle: BillingCycle;
  createdAt: Date;
  updatedAt: Date;
};
