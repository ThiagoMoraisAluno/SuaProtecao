// Shim de compatibilidade — tipos canônicos vivem em src/domain/entities/
export type {
  UserRole, PlanType, ClientStatus, RequestStatus, RequestType,
  ServiceType, CoverageType,
  User, Client, Supervisor, Plan, ClientAsset,
  ServiceRequest, CoverageRequest, Request,
  DashboardMetrics,
} from "@/domain/entities";
