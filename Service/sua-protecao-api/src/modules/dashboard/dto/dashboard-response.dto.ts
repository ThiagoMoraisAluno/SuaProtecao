import { ClientStatus, RequestStatus, RequestType } from '@prisma/client';

export type ClientsByPlanDto = {
  basic: number;
  intermediate: number;
  premium: number;
};

export type TopSupervisorDto = {
  id: string;
  name: string;
  clients: number;
  activeClients: number;
  defaulterClients: number;
  defaulterRate: number;
};

export type RecentRequestDto = {
  id: string;
  clientName: string;
  type: RequestType;
  description: string;
  status: RequestStatus;
  createdAt: Date;
};

export type ServiceUsageDto = {
  serviceType: string;
  count: number;
};

export type LossByPlanDto = {
  planId: string;
  planName: string;
  monthlyRevenue: number;
  approvedCoverageThisYear: number;
  netResultThisYear: number;
};

export type AdminDashboardDto = {
  totalClients: number;
  activeClients: number;
  defaulterClients: number;
  inactiveClients: number;
  defaulterRate: number;
  totalSupervisors: number;
  openRequests: number;
  pendingCoverage: number;
  monthlyRevenue: number;
  clientsByPlan: ClientsByPlanDto;
  topSupervisors: TopSupervisorDto[];
  recentRequests: RecentRequestDto[];
  serviceUsage: ServiceUsageDto[];
  lossByPlan: LossByPlanDto[];
};

export type RecentClientDto = {
  id: string;
  planId: string;
  planName: string;
  status: ClientStatus;
  joinedAt: Date;
};

export type SupervisorDashboardDto = {
  totalClients: number;
  activeClients: number;
  defaulterClients: number;
  inactiveClients: number;
  defaulterRate: number;
  estimatedMonthlyCommission: number;
  commissionPercentage: number;
  recentClients: RecentClientDto[];
};

export type PlanSummaryDto = {
  id: string;
  name: string;
  type: string;
  price: number;
  servicesPerMonth: number;
  coverageLimit: number;
  features: string[];
};

export type ClientSummaryDto = {
  id: string;
  name: string;
  status: ClientStatus;
  servicesUsedThisMonth: number;
};

export type SupervisorSummaryDto = {
  name: string;
  phone: string | null;
  email: string;
};

export type ClientRecentRequestDto = {
  id: string;
  type: RequestType;
  status: RequestStatus;
  description: string;
  createdAt: Date;
};

export type ClientDashboardDto = {
  client: ClientSummaryDto;
  plan: PlanSummaryDto;
  servicesLeft: number | null;
  coverageUsed: number;
  coverageRemaining: number;
  supervisor: SupervisorSummaryDto | null;
  recentRequests: ClientRecentRequestDto[];
};
