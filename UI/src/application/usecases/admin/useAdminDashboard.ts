"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { clientsService } from "@/services/clients.service";
import { supervisorsService } from "@/services/supervisors.service";
import { requestsService } from "@/services/requests.service";
import { plansService } from "@/services/plans.service";
import type {
  Client,
  Supervisor,
  Plan,
  Request,
  CoverageRequest,
} from "@/domain/entities";

export interface PlanWithCount extends Plan {
  count: number;
}

export interface ServiceUsageStat {
  serviceType: string;
  count: number;
}

export interface PlanLossStat {
  planId: string;
  planName: string;
  monthlyRevenue: number;
  approvedCoverageThisYear: number;
  netResultThisYear: number;
}

export interface AdminMetrics {
  active: number;
  defaulter: number;
  defaulterRate: number;
  openRequests: number;
  revenue: number;
  byPlan: PlanWithCount[];
  serviceUsage: ServiceUsageStat[];
  lossByPlan: PlanLossStat[];
}

export interface SupervisorWithStats extends Omit<Supervisor, "totalClients" | "activeClients"> {
  totalClients: number;
  activeClients: number;
  defaulterClients: number;
  defaulterRate: number;
}

export interface UseAdminDashboardReturn {
  isLoading: boolean;
  clients: Client[];
  supervisors: Supervisor[];
  requests: Request[];
  metrics: AdminMetrics;
  supervisorRanking: SupervisorWithStats[];
  recentRequests: Request[];
}

const OPEN_STATUSES = ["pending", "in_progress", "analyzing"] as const;

function rate(part: number, total: number): number {
  if (total === 0) return 0;
  return Number(((part / total) * 100).toFixed(2));
}

export function useAdminDashboard(): UseAdminDashboardReturn {
  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsService.findAll(),
  });
  const { data: supervisors = [], isLoading: loadingSupervisors } = useQuery({
    queryKey: ["supervisors"],
    queryFn: () => supervisorsService.findAll(),
  });
  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["requests"],
    queryFn: () => requestsService.findAll(),
  });
  const { data: plans = [], isLoading: loadingPlans } = useQuery({
    queryKey: ["plans"],
    queryFn: () => plansService.findAll(),
  });

  const isLoading = loadingClients || loadingSupervisors || loadingRequests || loadingPlans;

  const metrics = useMemo((): AdminMetrics => {
    const active = clients.filter((c) => c.status === "active").length;
    const defaulter = clients.filter((c) => c.status === "defaulter").length;
    const openRequests = requests.filter((r) =>
      (OPEN_STATUSES as readonly string[]).includes(r.status)
    ).length;
    const revenue = clients
      .filter((c) => c.status === "active")
      .reduce((sum, c) => {
        const plan = plans.find((p) => p.id === c.planId);
        return sum + (plan?.price ?? 0);
      }, 0);
    const byPlan = plans.map((p) => ({
      ...p,
      count: clients.filter((c) => c.planId === p.id).length,
    }));

    const serviceCounts = new Map<string, number>();
    for (const req of requests) {
      if (req.type !== "service") continue;
      const key = req.serviceName ?? req.serviceType;
      const current = serviceCounts.get(key) ?? 0;
      serviceCounts.set(key, current + 1);
    }
    const serviceUsage: ServiceUsageStat[] = Array.from(serviceCounts.entries())
      .map(([serviceType, count]) => ({ serviceType, count }))
      .sort((a, b) => b.count - a.count);

    // Prejuízo por plano: receita mensal projetada (ativos) − cobertura aprovada no ano corrente
    const yearStart = new Date(new Date().getFullYear(), 0, 1).getTime();
    const clientPlanById = new Map(clients.map((c) => [c.id, c.planId]));
    const approvedByPlan = new Map<string, number>();
    for (const req of requests) {
      if (req.type !== "coverage" || req.status !== "approved") continue;
      const cov = req as CoverageRequest;
      if (new Date(cov.createdAt).getTime() < yearStart) continue;
      const planId = clientPlanById.get(cov.clientId);
      if (!planId) continue;
      const current = approvedByPlan.get(planId) ?? 0;
      approvedByPlan.set(planId, current + (cov.approvedAmount ?? 0));
    }
    const lossByPlan: PlanLossStat[] = plans.map((plan) => {
      const planActive = clients.filter(
        (c) => c.planId === plan.id && c.status === "active"
      ).length;
      const monthly = planActive * plan.price;
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
      active,
      defaulter,
      defaulterRate: rate(defaulter, clients.length),
      openRequests,
      revenue,
      byPlan,
      serviceUsage,
      lossByPlan,
    };
  }, [clients, requests, plans]);

  const supervisorRanking = useMemo((): SupervisorWithStats[] => {
    return supervisors
      .map((s) => {
        const supervised = clients.filter((c) => c.supervisorId === s.id);
        const activeClients = supervised.filter((c) => c.status === "active").length;
        const defaulterClients = supervised.filter((c) => c.status === "defaulter").length;
        return {
          ...s,
          totalClients: supervised.length,
          activeClients,
          defaulterClients,
          defaulterRate: rate(defaulterClients, supervised.length),
        };
      })
      .sort(
        (a, b) =>
          b.activeClients - a.activeClients || a.defaulterRate - b.defaulterRate
      );
  }, [supervisors, clients]);

  const recentRequests = useMemo(() => requests.slice(0, 5), [requests]);

  return { isLoading, clients, supervisors, requests, metrics, supervisorRanking, recentRequests };
}
