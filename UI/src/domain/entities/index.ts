// ── Primitivos ──────────────────────────────────────────────────────────────
export type UserRole     = "admin" | "supervisor" | "client";
export type PlanType     = "basic" | "intermediate" | "premium";
export type ClientStatus = "active" | "inactive" | "defaulter";
export type RequestStatus =
  | "pending" | "in_progress" | "completed"
  | "denied"  | "analyzing"  | "approved";
export type RequestType  = "service" | "coverage";
export type ServiceType  =
  | "plumber" | "electrician" | "mason" | "locksmith"
  | "painter" | "carpenter"  | "cleaner" | "other";
export type CoverageType =
  | "theft" | "flood" | "structural_damage" | "fire" | "other";

// ── Base ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

// ── Agregados ────────────────────────────────────────────────────────────────
export interface ClientAsset {
  name: string;
  estimatedValue: number;
}

export interface Client extends User {
  role: "client";
  cpf: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  planId: string;
  supervisorId: string;
  status: ClientStatus;
  assets: ClientAsset[];
  totalAssetsValue: number;
  servicesUsedThisMonth: number;
  joinedAt: string;
  lastPaymentAt?: string;
}

export interface Supervisor extends User {
  role: "supervisor";
  commission: number;
  totalClients: number;
  activeClients: number;
}

export type BillingCycle = "monthly" | "annual";

export interface Plan {
  id: string;
  type: PlanType;
  name: string;
  price: number;
  servicesPerMonth: number; // -1 = ilimitado
  coverageLimit: number;
  features: string[];
  color: string;
  popular?: boolean;
  billingCycle?: BillingCycle;
  /** Percentual aplicado quando billingCycle = "annual" (0..100) */
  annualDiscount?: number;
}

export interface ServiceRequest {
  id: string;
  clientId: string;
  clientName: string;
  type: "service";
  serviceId?: string | null;
  serviceType: ServiceType | string;
  serviceName?: string | null;
  serviceIcon?: string | null;
  description: string;
  desiredDate: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
}

export interface CoverageRequest {
  id: string;
  clientId: string;
  clientName: string;
  type: "coverage";
  coverageType: CoverageType;
  description: string;
  estimatedLoss: number;
  evidenceUrls: string[];
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  approvedAmount?: number;
}

export type Request = ServiceRequest | CoverageRequest;

export interface DashboardMetrics {
  totalClients: number;
  activeClients: number;
  defaulterClients: number;
  inactiveClients: number;
  totalSupervisors: number;
  openRequests: number;
  pendingCoverage: number;
  monthlyRevenue: number;
  clientsByPlan: Record<PlanType, number>;
  topSupervisors: Array<{ id: string; name: string; clients: number; activeClients: number }>;
  dailyGrowth: number;
  monthlyGrowth: number;
}

// ── Catálogo dinâmico de serviços ────────────────────────────────────────
export interface Service {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlanServiceRule {
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
  createdAt: string;
  updatedAt: string;
}

// ── Pagamentos ────────────────────────────────────────────────────────────
export type PaymentMethod = "pix" | "boleto" | "credit_card";
export type PaymentStatus =
  | "pending"
  | "confirmed"
  | "overdue"
  | "refunded"
  | "cancelled";

export interface Payment {
  id: string;
  clientId: string;
  clientName: string | null;
  planId: string;
  planName: string | null;
  asaasPaymentId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  installment: number | null;
  totalInstallments: number | null;
  pixCode: string | null;
  pixQrCode: string | null;
  boletoUrl: string | null;
  boletoBarCode: string | null;
  invoiceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentListResponse {
  items: Payment[];
  total: number;
}

// ── Notificações ──────────────────────────────────────────────────────────
export type NotificationType =
  | "request_opened"
  | "request_updated"
  | "request_closed"
  | "payment_overdue"
  | "payment_confirmed";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  items: Notification[];
  total: number;
  unreadCount: number;
}
