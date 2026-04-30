"use client";
import { PageSkeleton } from "@/components/ui/PageSkeleton";

import { useMemo } from "react";
import Link from "next/link";
import { Shield, Wrench, AlertCircle, CheckCircle, Phone, Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/features/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { clientsService } from "@/services/clients.service";
import { plansService } from "@/services/plans.service";
import { supervisorsService } from "@/services/supervisors.service";
import { requestsService } from "@/services/requests.service";
import {
  formatCurrency, getClientStatusConfig, getRequestStatusConfig,
  getServiceTypeLabel, getCoverageTypeLabel,
} from "@/lib/utils";
import { WHATSAPP_URL } from "@/constants";
import type { CoverageRequest } from "@/types";

export default function ClientDashboardPage() {
  const { user } = useAuth();

  const { data: client, isLoading: loadingClient } = useQuery({
    queryKey: ["client-me", user?.id],
    queryFn: () => clientsService.findOne(user!.id),
    enabled: !!user?.id,
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["plans"],
    queryFn: () => plansService.findAll(),
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["client-requests", user?.id],
    queryFn: () => requestsService.findAll(),
    enabled: !!user?.id,
  });

  const { data: supervisor } = useQuery({
    queryKey: ["supervisor", client?.supervisorId],
    queryFn: () => supervisorsService.findOne(client!.supervisorId),
    enabled: !!client?.supervisorId,
  });

  const plan = plans.find((p) => p.id === client?.planId);

  const servicesLeft = plan && client
    ? plan.servicesPerMonth === -1
      ? "Ilimitado"
      : Math.max(0, plan.servicesPerMonth - client.servicesUsedThisMonth)
    : 0;

  const coverageUsed = useMemo(() => {
    return requests
      .filter((r): r is CoverageRequest => r.type === "coverage" && r.status === "approved")
      .reduce((sum, r) => sum + (r.approvedAmount ?? 0), 0);
  }, [requests]);

  const coverageRemaining = plan ? Math.max(0, plan.coverageLimit - coverageUsed) : 0;
  const coveragePct = plan ? Math.min(100, (coverageUsed / plan.coverageLimit) * 100) : 0;
  const recentRequests = requests.slice(0, 3);

  if (loadingClient) {
    return (
      <PageSkeleton />
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Dados do cliente não encontrados.</p>
      </div>
    );
  }

  const statusCfg = getClientStatusConfig(client.status);
  const isBlocked = client.status === "defaulter";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-brand-200 text-sm mb-1">Bem-vindo(a) de volta!</p>
            <h1 className="text-2xl font-bold font-display">{client.name.split(" ")[0]}</h1>
            <p className="text-brand-200 text-sm mt-1">{client.address.city}, {client.address.state}</p>
          </div>
          <StatusBadge {...statusCfg} />
        </div>
      </div>

      {isBlocked && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">Conta com pagamento pendente</p>
            <p className="text-sm text-red-700 mt-1">Novas solicitações estão bloqueadas. Regularize o pagamento ou fale com o suporte.</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Link
                href="/client/checkout"
                className="inline-flex items-center gap-2 bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
              >
                Pagar agora
              </Link>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white border border-red-200 text-red-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-50 transition-colors">
                <Phone size={16} /> Suporte
              </a>
            </div>
          </div>
        </div>
      )}

      {!isBlocked && plan && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/client/checkout"
            className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-brand-300 text-sm font-semibold text-slate-700 px-4 py-2 rounded-xl transition-colors"
          >
            Pagar mensalidade
          </Link>
          <Link
            href="/client/payments"
            className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-brand-300 text-sm font-semibold text-slate-700 px-4 py-2 rounded-xl transition-colors"
          >
            Histórico de pagamentos
          </Link>
        </div>
      )}

      {plan && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className={`p-5 ${plan.type === "basic" ? "bg-slate-700" : plan.type === "intermediate" ? "bg-brand-600" : "bg-violet-700"} text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5" />
                <div>
                  <p className="text-sm font-bold">{plan.name}</p>
                  <p className="text-xs opacity-80">{formatCurrency(plan.price)}/mês</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-80">Cobertura máxima</p>
                <p className="text-lg font-bold font-display">{formatCurrency(plan.coverageLimit)}</p>
              </div>
            </div>
          </div>
          <div className="p-5 grid sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-2xl font-bold font-display text-slate-900">
                {typeof servicesLeft === "number" ? servicesLeft : "∞"}
              </p>
              <p className="text-xs text-slate-500 mt-1">Serviços disponíveis este mês</p>
              {plan.servicesPerMonth !== -1 && (
                <p className="text-xs text-slate-400 mt-0.5">{client.servicesUsedThisMonth}/{plan.servicesPerMonth} usados</p>
              )}
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl sm:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500">Cobertura utilizada</p>
                <p className="text-xs font-semibold text-emerald-600">{formatCurrency(coverageRemaining)} restantes</p>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${coveragePct}%` }} />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-xs text-slate-400">{formatCurrency(coverageUsed)} usados</p>
                <p className="text-xs text-slate-400">de {formatCurrency(plan.coverageLimit)}</p>
              </div>
            </div>
          </div>
          <div className="px-5 pb-5">
            <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Incluso no seu plano</p>
            <div className="flex flex-wrap gap-2">
              {plan.features.map((f) => (
                <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 text-xs font-medium rounded-lg border border-brand-100">
                  <CheckCircle className="w-3 h-3" />{f}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/client/requests/new/service"
          className={`flex items-center gap-4 p-5 bg-white rounded-xl border-2 shadow-sm transition-all ${isBlocked ? "border-slate-100 opacity-50 pointer-events-none" : "border-slate-100 hover:border-brand-200 hover:shadow-md group"}`}>
          <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center group-hover:bg-brand-100 transition-colors">
            <Wrench className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Solicitar Serviço</p>
            <p className="text-xs text-slate-400">Encanador, eletricista, etc.</p>
          </div>
        </Link>
        <Link href="/client/requests/new/coverage"
          className={`flex items-center gap-4 p-5 bg-white rounded-xl border-2 shadow-sm transition-all ${isBlocked ? "border-slate-100 opacity-50 pointer-events-none" : "border-slate-100 hover:border-purple-200 hover:shadow-md group"}`}>
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Acionar Cobertura</p>
            <p className="text-xs text-slate-400">Roubo, enchente, danos</p>
          </div>
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Home className="w-4 h-4 text-brand-600" /> Bens Cadastrados
            </h2>
            <span className="text-xs font-bold text-slate-500">{client.assets.length} itens</span>
          </div>
          {client.assets.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum bem cadastrado</p>
          ) : (
            <div className="space-y-2">
              {client.assets.map((asset, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-700">{asset.name}</span>
                  <span className="text-sm font-semibold text-slate-900">{formatCurrency(asset.estimatedValue)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t-2 border-slate-100 mt-2">
                <span className="text-sm font-semibold text-slate-700">Total estimado</span>
                <span className="text-sm font-bold text-brand-600">{formatCurrency(client.totalAssetsValue)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {supervisor && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Seu Consultor</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <span className="text-sm font-bold text-amber-700">{supervisor.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{supervisor.name}</p>
                  <p className="text-xs text-slate-400">{supervisor.phone || supervisor.email}</p>
                </div>
              </div>
            </div>
          )}
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer"
            className="flex items-center gap-4 p-5 bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Falar com suporte</p>
              <p className="text-xs text-emerald-100">Atendimento via WhatsApp</p>
            </div>
          </a>
        </div>
      </div>

      {recentRequests.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Chamados Recentes</h2>
            <Link href="/client/requests" className="text-xs text-brand-600 hover:text-brand-700 font-medium">Ver todos →</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentRequests.map((req) => {
              const sc = getRequestStatusConfig(req.status);
              return (
                <div key={req.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${req.type === "service" ? "bg-blue-50" : "bg-purple-50"}`}>
                      <span className="text-sm">{req.type === "service" ? "🔧" : "🛡️"}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {req.type === "service" ? getServiceTypeLabel(req.serviceType) : getCoverageTypeLabel(req.coverageType)}
                      </p>
                      <p className="text-xs text-slate-400">{new Date(req.createdAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                  <StatusBadge {...sc} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
