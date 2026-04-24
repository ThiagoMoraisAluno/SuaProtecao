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
  createdAt: Date;
  updatedAt: Date;
};
