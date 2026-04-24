import { Injectable } from '@nestjs/common';
import { ClientStatus, RequestStatus, RequestType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { IDashboardRepository } from './interfaces/dashboard-repository.interface';
import {
  AdminDashboardDto,
  SupervisorDashboardDto,
  ClientDashboardDto,
} from './dto/dashboard-response.dto';

@Injectable()
export class DashboardRepository implements IDashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminDashboard(): Promise<AdminDashboardDto> {
    const [clients, supervisors, requests, recentRequests] = await Promise.all([
      this.prisma.client.findMany({ include: { plan: true } }),
      this.prisma.supervisor.findMany({
        include: {
          user: { include: { profile: true } },
          clients: { where: { status: ClientStatus.active } },
        },
        orderBy: { clients: { _count: 'desc' } },
      }),
      this.prisma.request.findMany({
        select: { status: true, type: true },
      }),
      this.prisma.request.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          clientName: true,
          type: true,
          description: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    const totalClients = clients.length;
    const activeClients = clients.filter(
      (c) => c.status === ClientStatus.active,
    ).length;
    const defaulterClients = clients.filter(
      (c) => c.status === ClientStatus.defaulter,
    ).length;
    const inactiveClients = clients.filter(
      (c) => c.status === ClientStatus.inactive,
    ).length;

    const monthlyRevenue = clients
      .filter((c) => c.status === ClientStatus.active)
      .reduce((sum, c) => sum + Number(c.plan.price), 0);

    const openRequests = requests.filter((r) =>
      (
        [
          RequestStatus.pending,
          RequestStatus.in_progress,
          RequestStatus.analyzing,
        ] as RequestStatus[]
      ).includes(r.status),
    ).length;

    const pendingCoverage = requests.filter(
      (r) =>
        r.type === RequestType.coverage &&
        r.status === RequestStatus.analyzing,
    ).length;

    const clientsByPlan = {
      basic: clients.filter((c) => c.plan.type === 'basic').length,
      intermediate: clients.filter((c) => c.plan.type === 'intermediate').length,
      premium: clients.filter((c) => c.plan.type === 'premium').length,
    };

    const topSupervisors = supervisors.slice(0, 5).map((s) => ({
      id: s.id,
      name: s.user.profile?.username ?? '',
      clients: s.clients.length,
      activeClients: s.clients.length,
    }));

    return {
      totalClients,
      activeClients,
      defaulterClients,
      inactiveClients,
      totalSupervisors: supervisors.length,
      openRequests,
      pendingCoverage,
      monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
      clientsByPlan,
      topSupervisors,
      recentRequests,
    };
  }

  async getSupervisorDashboard(
    supervisorId: string,
  ): Promise<SupervisorDashboardDto | null> {
    const supervisor = await this.prisma.supervisor.findUnique({
      where: { id: supervisorId },
    });
    if (!supervisor) return null;

    const clients = await this.prisma.client.findMany({
      where: { supervisorId },
      include: { plan: true },
      orderBy: { joinedAt: 'desc' },
    });

    const totalClients = clients.length;
    const activeClients = clients.filter(
      (c) => c.status === ClientStatus.active,
    ).length;
    const defaulterClients = clients.filter(
      (c) => c.status === ClientStatus.defaulter,
    ).length;
    const inactiveClients = clients.filter(
      (c) => c.status === ClientStatus.inactive,
    ).length;

    const commission = Number(supervisor.commission);
    const totalActiveRevenue = clients
      .filter((c) => c.status === ClientStatus.active)
      .reduce((sum, c) => sum + Number(c.plan.price), 0);
    const estimatedMonthlyCommission = totalActiveRevenue * (commission / 100);

    return {
      totalClients,
      activeClients,
      defaulterClients,
      inactiveClients,
      estimatedMonthlyCommission: Number(estimatedMonthlyCommission.toFixed(2)),
      commissionPercentage: commission,
      recentClients: clients.slice(0, 5).map((c) => ({
        id: c.id,
        planId: c.planId,
        planName: c.plan.name,
        status: c.status,
        joinedAt: c.joinedAt,
      })),
    };
  }

  async getClientDashboard(
    clientId: string,
  ): Promise<ClientDashboardDto | null> {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        plan: true,
        user: { include: { profile: true } },
        supervisor: { include: { user: { include: { profile: true } } } },
        requests: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!client) return null;

    const coverageUsed = await this.prisma.request.aggregate({
      where: {
        clientId,
        type: RequestType.coverage,
        status: RequestStatus.approved,
      },
      _sum: { approvedAmount: true },
    });

    const coverageUsedAmount = Number(coverageUsed._sum.approvedAmount ?? 0);
    const coverageLimit = Number(client.plan.coverageLimit);
    const servicesLeft =
      client.plan.servicesPerMonth === -1
        ? null
        : client.plan.servicesPerMonth - client.servicesUsedThisMonth;

    return {
      client: {
        id: client.id,
        name: client.user.profile?.username ?? '',
        status: client.status,
        servicesUsedThisMonth: client.servicesUsedThisMonth,
      },
      plan: {
        id: client.plan.id,
        name: client.plan.name,
        type: client.plan.type,
        price: Number(client.plan.price),
        servicesPerMonth: client.plan.servicesPerMonth,
        coverageLimit,
        features: client.plan.features,
      },
      servicesLeft,
      coverageUsed: coverageUsedAmount,
      coverageRemaining: Math.max(0, coverageLimit - coverageUsedAmount),
      supervisor: client.supervisor
        ? {
            name: client.supervisor.user.profile?.username ?? '',
            phone: client.supervisor.user.profile?.phone ?? null,
            email: client.supervisor.user.email,
          }
        : null,
      recentRequests: client.requests.map((r) => ({
        id: r.id,
        type: r.type,
        status: r.status,
        description: r.description,
        createdAt: r.createdAt,
      })),
    };
  }
}
