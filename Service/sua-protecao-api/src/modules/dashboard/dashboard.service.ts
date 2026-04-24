import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IDashboardRepository,
  DASHBOARD_REPOSITORY_TOKEN,
} from './interfaces/dashboard-repository.interface';
import {
  AdminDashboardDto,
  SupervisorDashboardDto,
  ClientDashboardDto,
} from './dto/dashboard-response.dto';

@Injectable()
export class DashboardService {
  constructor(
    @Inject(DASHBOARD_REPOSITORY_TOKEN)
    private readonly dashboardRepository: IDashboardRepository,
  ) {}

  async getAdminDashboard(): Promise<AdminDashboardDto> {
    return this.dashboardRepository.getAdminDashboard();
  }

  async getSupervisorDashboard(
    supervisorId: string,
  ): Promise<SupervisorDashboardDto> {
    const result =
      await this.dashboardRepository.getSupervisorDashboard(supervisorId);
    if (!result) throw new NotFoundException('Supervisor não encontrado.');
    return result;
  }

  async getClientDashboard(clientId: string): Promise<ClientDashboardDto> {
    const result =
      await this.dashboardRepository.getClientDashboard(clientId);
    if (!result) throw new NotFoundException('Cliente não encontrado.');
    return result;
  }
}
