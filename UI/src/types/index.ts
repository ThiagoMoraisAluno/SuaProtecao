// Shim de compatibilidade — tipos canônicos vivem em src/domain/entities/
export type {
  UserRole, PlanType, ClientStatus, RequestStatus, RequestType,
  ServiceType, CoverageType, BillingCycle,
  User, Client, Supervisor, Plan, ClientAsset,
  ServiceRequest, CoverageRequest, Request,
  DashboardMetrics,
  Service, PlanServiceRule,
  Notification, NotificationType, NotificationListResponse,
  Payment, PaymentMethod, PaymentStatus, PaymentListResponse,
} from "@/domain/entities";
