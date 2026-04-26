"use client";

import {
  Users, UserCheck, TrendingUp, AlertCircle, FileText,
  Shield, DollarSign, BarChart3, Award,
} from "lucide-react";
import { MetricCard } from "@/components/features/MetricCard";
import { StatusBadge } from "@/components/features/StatusBadge";
import { formatCurrency, getRequestStatusConfig } from "@/lib/utils";
import { useAdminDashboard } from "@/application/usecases/admin/useAdminDashboard";

export default function AdminDashboardPage() {
  const {
    isLoading,
    clients,
    supervisors,
    requests,
    metrics,
    supervisorRanking,
    recentRequests,
  } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Dashboard Admin</h1>
        <p className="text-slate-500 text-sm mt-1">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total de Clientes" value={clients.length} icon={<Users size={22} />} colorClass="text-brand-600" />
        <MetricCard title="Clientes Ativos" value={metrics.active}
          subtitle={clients.length > 0 ? `${Math.round((metrics.active / clients.length) * 100)}% do total` : "0%"}
          icon={<UserCheck size={22} />} colorClass="text-emerald-600" />
        <MetricCard title="Inadimplentes" value={metrics.defaulter} icon={<AlertCircle size={22} />} colorClass="text-red-500" />
        <MetricCard title="Receita Mensal" value={formatCurrency(metrics.revenue)} icon={<DollarSign size={22} />} colorClass="text-violet-600" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Supervisores" value={supervisors.length} icon={<Award size={22} />} colorClass="text-amber-600" />
        <MetricCard title="Chamados Abertos" value={metrics.openRequests} icon={<FileText size={22} />} colorClass="text-blue-600" />
        <MetricCard title="Total de Chamados" value={requests.length} icon={<BarChart3 size={22} />} colorClass="text-slate-600" />
        <MetricCard title="Supervisores Ativos" value={supervisors.length} icon={<TrendingUp size={22} />} colorClass="text-emerald-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-600" /> Clientes por Plano
          </h2>
          <div className="space-y-4">
            {metrics.byPlan.map((plan) => {
              const pct = clients.length > 0 ? Math.round((plan.count / clients.length) * 100) : 0;
              return (
                <div key={plan.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-700">{plan.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-brand-600">{formatCurrency(plan.price)}</span>
                      <span className="text-sm font-bold text-slate-900">{plan.count}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${
                      plan.type === "basic" ? "bg-slate-400" : plan.type === "intermediate" ? "bg-brand-500" : "bg-violet-500"
                    }`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{pct}% dos clientes</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" /> Ranking de Supervisores
          </h2>
          {supervisorRanking.length === 0 ? (
            <p className="text-slate-400 text-sm">Nenhum supervisor cadastrado</p>
          ) : (
            <div className="space-y-3">
              {supervisorRanking.map((sup, index) => (
                <div key={sup.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? "bg-amber-100 text-amber-700" : index === 1 ? "bg-slate-200 text-slate-700" : "bg-orange-100 text-orange-700"
                  }`}>{index + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{sup.name}</p>
                    <p className="text-xs text-slate-500">{sup.totalClients} clientes · {sup.activeClients} ativos</p>
                  </div>
                  <span className="text-sm font-bold text-brand-600">{sup.activeClients}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-600" /> Chamados Recentes
          </h2>
        </div>
        {recentRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Nenhum chamado ainda</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Cliente</th>
                  <th className="table-header">Tipo</th>
                  <th className="table-header">Descrição</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Data</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req) => {
                  const statusCfg = getRequestStatusConfig(req.status);
                  return (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="table-cell font-medium text-slate-900">{req.clientName}</td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${req.type === "service" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>
                          {req.type === "service" ? "Serviço" : "Cobertura"}
                        </span>
                      </td>
                      <td className="table-cell text-slate-500 max-w-xs truncate">{req.description}</td>
                      <td className="table-cell"><StatusBadge {...statusCfg} /></td>
                      <td className="table-cell text-slate-400 text-xs">{new Date(req.createdAt).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
