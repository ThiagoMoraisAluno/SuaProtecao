"use client";

import Link from "next/link";
import { Users, UserCheck, AlertCircle, TrendingUp, UserPlus } from "lucide-react";
import { MetricCard } from "@/components/features/MetricCard";
import { StatusBadge } from "@/components/features/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { getClientStatusConfig, getPlanLabel, formatDate, formatCurrency } from "@/lib/utils";
import { useSupervisorDashboard } from "@/application/usecases/supervisor/useSupervisorDashboard";

export default function SupervisorDashboardPage() {
  const { user } = useAuth();
  const { isLoading, stats, monthlyCommission, recentClients } = useSupervisorDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Olá, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">Resumo dos seus clientes</p>
        </div>
        <Link href="/supervisor/clients" className="btn-primary">
          <UserPlus size={18} /> Novo Cliente
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total de Clientes" value={stats.total} icon={<Users size={22} />} colorClass="text-brand-600" />
        <MetricCard title="Clientes Ativos" value={stats.active} icon={<UserCheck size={22} />} colorClass="text-emerald-600" />
        <MetricCard title="Inadimplentes" value={stats.defaulter} icon={<AlertCircle size={22} />} colorClass="text-red-500" />
        <MetricCard title="Comissão Estimada" value={formatCurrency(monthlyCommission)} subtitle="10% sobre ativos" icon={<TrendingUp size={22} />} colorClass="text-violet-600" />
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Distribuição de Status</h2>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {stats.total > 0 && (
            <>
              <div className="bg-emerald-500 transition-all" style={{ width: `${(stats.active / stats.total) * 100}%` }} />
              <div className="bg-red-400 transition-all" style={{ width: `${(stats.defaulter / stats.total) * 100}%` }} />
              <div className="bg-slate-300 transition-all" style={{ width: `${(stats.inactive / stats.total) * 100}%` }} />
            </>
          )}
        </div>
        <div className="flex items-center gap-6 mt-3">
          {[
            { label: "Ativos", value: stats.active, color: "bg-emerald-500" },
            { label: "Inadimplentes", value: stats.defaulter, color: "bg-red-400" },
            { label: "Inativos", value: stats.inactive, color: "bg-slate-300" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <span className="text-xs text-slate-500">{item.label}: <strong className="text-slate-700">{item.value}</strong></span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Clientes Recentes</h2>
          <Link href="/supervisor/clients" className="text-sm text-brand-600 hover:text-brand-700 font-medium">Ver todos →</Link>
        </div>
        {recentClients.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-slate-400 mb-4">Você ainda não cadastrou nenhum cliente</p>
            <Link href="/supervisor/clients" className="btn-primary justify-center">
              <UserPlus size={18} /> Cadastrar primeiro cliente
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentClients.map((client) => {
              const statusCfg = getClientStatusConfig(client.status);
              return (
                <div key={client.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-brand-700">{client.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{client.name}</p>
                      <p className="text-xs text-slate-400">{getPlanLabel(client.planId)} · Desde {formatDate(client.joinedAt)}</p>
                    </div>
                  </div>
                  <StatusBadge {...statusCfg} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
