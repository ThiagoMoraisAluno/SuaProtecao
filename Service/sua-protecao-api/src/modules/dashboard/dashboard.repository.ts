import { Injectable } from '@nestjs/common';
import {
  ClientStatus,
  PaymentStatus,
  RequestStatus,
  RequestType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { IDashboardRepository } from './interfaces/dashboard-repository.interface';
import {
  AdminDashboardDto,
  SupervisorDashboardDto,
  ClientDashboardDto,
  LossByPlanDto,
  RevenueSummaryDto,
} from './dto/dashboard-response.dto';

const PERCENT_PRECISION = 2;

function rate(part: number, total: number): number {
  if (total === 0) return 0;
  return Number(((part / total) * 100).toFixed(PERCENT_PRECISION));
}

function startOfCurrentYear(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1);
}

@Injectable()
export class DashboardRepository implements IDashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminDashboard(): Promise<AdminDashboardDto> {
    const yearStart = startOfCurrentYear();
    const revenue = await this.computeRevenue();

    const [
      clients,
      supervisors,
      requests,
      recentRequests,
      serviceUsageRaw,
      approvedCoverageByPlan,
      plans,
    ] = await Promise.all([
      this.prisma.client.findMany({ include: { plan: true } }),
      this.prisma.supervisor.findMany({
        include: {
          user: { include: { profile: true } },
          clients: true,
        },
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
      this.prisma.request.groupBy({
        by: ['serviceType'],
        where: {
          type: RequestType.service,
          serviceType: { not: null },
        },
        _count: { _all: true },
      }),
      this.prisma.request.findMany({
        where: {
          type: RequestType.coverage,
          status: RequestStatus.approved,
          createdAt: { gte: yearStart },
        },
        select: { clientId: true, approvedAmount: true },
      }),
      this.prisma.plan.findMany(),
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

    // Ranking de supervisores: ordena por clientes ativos (desc); empate menor inadimplência
    const supervisorsRanked = supervisors
      .map((s) => {
        const total = s.clients.length;
        const active = s.clients.filter(
          (c) => c.status === ClientStatus.active,
        ).length;
        const defaulter = s.clients.filter(
          (c) => c.status === ClientStatus.defaulter,
        ).length;
        return {
          id: s.id,
          name: s.user.profile?.username ?? '',
          clients: total,
          activeClients: active,
          defaulterClients: defaulter,
          defaulterRate: rate(defaulter, total),
        };
      })
      .sort(
        (a, b) =>
          b.activeClients - a.activeClients ||
          a.defaulterRate - b.defaulterRate,
      );

    const topSupervisors = supervisorsRanked.slice(0, 5);

    // Uso por serviço — só requests do tipo service
    const serviceUsage = serviceUsageRaw
      .filter((row) => row.serviceType !== null)
      .map((row) => ({
        serviceType: row.serviceType as string,
        count: row._count._all,
      }))
      .sort((a, b) => b.count - a.count);

    // Prejuízo por plano (ano corrente):
    //   receita mensal projetada (clientes ativos × preço) − cobertura aprovada no ano
    const clientToPlanId = new Map(clients.map((c) => [c.id, c.planId]));
    const approvedByPlan = new Map<string, number>();
    for (const row of approvedCoverageByPlan) {
      const planId = clientToPlanId.get(row.clientId);
      if (!planId) continue;
      const current = approvedByPlan.get(planId) ?? 0;
      approvedByPlan.set(planId, current + Number(row.approvedAmount ?? 0));
    }

    const lossByPlan: LossByPlanDto[] = plans.map((plan) => {
      const planActive = clients.filter(
        (c) => c.planId === plan.id && c.status === ClientStatus.active,
      ).length;
      const monthly = planActive * Number(plan.price);
      const approved = approvedByPlan.get(plan.id) ?? 0;
      return {
        planId: plan.id,
        planName: plan.name,
        monthlyRevenue: Number(monthly.toFixed(2)),
        approvedCoverageThisYear: Number(approved.toFixed(2)),
        netResultThisYear: Number((monthly * 12 - approved).toFixed(2)),
      };
    });

    return {
      totalClients,
      activeClients,
      defaulterClients,
      inactiveClients,
      defaulterRate: rate(defaulterClients, totalClients),
      totalSupervisors: supervisors.length,
      openRequests,
      pendingCoverage,
      monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
      revenue,
      clientsByPlan,
      topSupervisors,
      recentRequests,
      serviceUsage,
      lossByPlan,
    };
  }

  /**
   * Faturamento confirmado: soma de `payments` com status = confirmed nas
   * janelas de tempo. `overdueOpen` traz a soma do que está vencido (status =
   * overdue) — útil para o card de inadimplência financeira.
   */
  private async computeRevenue(): Promise<RevenueSummaryDto> {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisYearStart = new Date(now.getFullYear(), 0, 1);

    const [thisMonth, lastMonth, thisYear, overdueOpen] = await Promise.all([
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.confirmed,
          paidAt: { gte: thisMonthStart },
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.confirmed,
          paidAt: { gte: lastMonthStart, lt: thisMonthStart },
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.confirmed,
          paidAt: { gte: thisYearStart },
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.overdue },
        _sum: { amount: true },
      }),
    ]);

    return {
      thisMonth: Number(thisMonth._sum.amount ?? 0),
      lastMonth: Number(lastMonth._sum.amount ?? 0),
      thisYear: Number(thisYear._sum.amount ?? 0),
      overdueOpen: Number(overdueOpen._sum.amount ?? 0),
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
      defaulterRate: rate(defaulterClients, totalClients),
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
