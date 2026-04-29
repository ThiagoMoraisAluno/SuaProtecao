"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supervisorsService } from "@/services/supervisors.service";
import { plansService } from "@/services/plans.service";
import type { Client } from "@/domain/entities";

export interface ClientStats {
  total: number;
  active: number;
  defaulter: number;
  inactive: number;
  defaulterRate: number;
}

export interface UseSupervisorDashboardReturn {
  isLoading: boolean;
  clients: Client[];
  stats: ClientStats;
  monthlyCommission: number;
  recentClients: Client[];
}

const COMMISSION_RATE = 0.1;

function rate(part: number, total: number): number {
  if (total === 0) return 0;
  return Number(((part / total) * 100).toFixed(2));
}

export function useSupervisorDashboard(): UseSupervisorDashboardReturn {
  const { user } = useAuth();

  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ["supervisor-clients", user?.id],
    queryFn: () => supervisorsService.getClients(user!.id),
    enabled: !!user?.id,
  });

  const { data: plans = [], isLoading: loadingPlans } = useQuery({
    queryKey: ["plans"],
    queryFn: () => plansService.findAll(),
  });

  const isLoading = loadingClients || loadingPlans;

  const stats = useMemo((): ClientStats => {
    const total = clients.length;
    const active = clients.filter((c) => c.status === "active").length;
    const defaulter = clients.filter((c) => c.status === "defaulter").length;
    const inactive = clients.filter((c) => c.status === "inactive").length;
    return {
      total,
      active,
      defaulter,
      inactive,
      defaulterRate: rate(defaulter, total),
    };
  }, [clients]);

  const monthlyCommission = useMemo(() => {
    return clients
      .filter((c) => c.status === "active")
      .reduce((sum, c) => {
        const plan = plans.find((p) => p.id === c.planId);
        return sum + (plan?.price ?? 0) * COMMISSION_RATE;
      }, 0);
  }, [clients, plans]);

  const recentClients = useMemo(() => {
    return [...clients]
      .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
      .slice(0, 5);
  }, [clients]);

  return { isLoading, clients, stats, monthlyCommission, recentClients };
}
