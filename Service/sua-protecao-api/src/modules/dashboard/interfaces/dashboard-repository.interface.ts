import {
  AdminDashboardDto,
  SupervisorDashboardDto,
  ClientDashboardDto,
} from '../dto/dashboard-response.dto';

export interface IDashboardRepository {
  getAdminDashboard(): Promise<AdminDashboardDto>;
  getSupervisorDashboard(supervisorId: string): Promise<SupervisorDashboardDto | null>;
  getClientDashboard(clientId: string): Promise<ClientDashboardDto | null>;
}

export const DASHBOARD_REPOSITORY_TOKEN = 'DASHBOARD_REPOSITORY';
