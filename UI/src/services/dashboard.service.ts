import api from "@/lib/api";

export interface AdminDashboardData {
  totalClients: number;
  activeClients: number;
  defaulterClients: number;
  inactiveClients: number;
  totalSupervisors: number;
  openRequests: number;
  monthlyRevenue: number;
}

export interface SupervisorDashboardData {
  totalClients: number;
  activeClients: number;
  defaulterClients: number;
  inactiveClients: number;
  estimatedCommission: number;
}

export interface ClientDashboardData {
  planName: string;
  servicesUsedThisMonth: number;
  servicesPerMonth: number;
  coverageUsed: number;
  coverageLimit: number;
  status: string;
}

export const dashboardService = {
  async getAdmin(): Promise<AdminDashboardData> {
    const { data } = await api.get<AdminDashboardData>("/dashboard/admin");
    return data;
  },

  async getSupervisor(): Promise<SupervisorDashboardData> {
    const { data } = await api.get<SupervisorDashboardData>("/dashboard/supervisor");
    return data;
  },

  async getClient(): Promise<ClientDashboardData> {
    const { data } = await api.get<ClientDashboardData>("/dashboard/client");
    return data;
  },
};
