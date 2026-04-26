"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { clientsService } from "@/services/clients.service";
import { supervisorsService } from "@/services/supervisors.service";
import { requestsService } from "@/services/requests.service";
import { plansService } from "@/services/plans.service";
import type { Client, Supervisor, Plan, Request } from "@/domain/entities";

export interface PlanWithCount extends Plan {
  count: number;
}

export interface AdminMetrics {
  active: number;
  defaulter: number;
  openRequests: number;
  revenue: number;
  byPlan: PlanWithCount[];
}

export interface SupervisorWithStats extends Omit<Supervisor, "totalClients" | "activeClients"> {
  totalClients: number;
  activeClients: number;
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
    return { active, defaulter, openRequests, revenue, byPlan };
  }, [clients, requests, plans]);

  const supervisorRanking = useMemo((): SupervisorWithStats[] => {
    return supervisors
      .map((s) => {
        const supervised = clients.filter((c) => c.supervisorId === s.id);
        return {
          ...s,
          totalClients: supervised.length,
          activeClients: supervised.filter((c) => c.status === "active").length,
        };
      })
      .sort((a, b) => b.activeClients - a.activeClients);
  }, [supervisors, clients]);

  const recentRequests = useMemo(() => requests.slice(0, 5), [requests]);

  return { isLoading, clients, supervisors, requests, metrics, supervisorRanking, recentRequests };
}
