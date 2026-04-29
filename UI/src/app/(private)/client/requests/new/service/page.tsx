"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ArrowLeft, Wrench } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { clientsService } from "@/services/clients.service";
import { plansService } from "@/services/plans.service";
import { planRulesService } from "@/services/plan-rules.service";
import { requestsService } from "@/services/requests.service";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";

export default function NewServiceRequestPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [serviceId, setServiceId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [desiredDate, setDesiredDate] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: client } = useQuery({
    queryKey: ["client-me", user?.id],
    queryFn: () => clientsService.findOne(user!.id),
    enabled: !!user?.id,
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["plans"],
    queryFn: () => plansService.findAll(),
  });

  const { data: rules = [], isLoading: loadingRules } = useQuery({
    queryKey: ["plan-rules", client?.planId],
    queryFn: () => planRulesService.findByPlan(client!.planId),
    enabled: !!client?.planId,
  });

  const plan = plans.find((p) => p.id === client?.planId);
  const availableRules = rules.filter((r) => r.serviceIsActive);
  const selectedRule = availableRules.find((r) => r.serviceId === serviceId) ?? null;

  // Pré-seleciona o primeiro serviço disponível assim que as regras chegam
  useEffect(() => {
    if (!serviceId && availableRules.length > 0) {
      setServiceId(availableRules[0].serviceId);
    }
  }, [availableRules, serviceId]);

  const createMutation = useMutation({
    mutationFn: () =>
      requestsService.createService({ serviceId, description, desiredDate }),
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Chamado de serviço enviado com sucesso!");
    },
    onError: (err: unknown) => {
      toast.error(
        axios.isAxiosError<{ message: string }>(err)
          ? (err.response?.data?.message ?? "Erro ao enviar chamado.")
          : "Erro ao enviar chamado."
      );
    },
  });

  if (client?.status === "defaulter") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-lg font-bold text-red-800 mb-2">Conta Inadimplente</h2>
        <p className="text-red-700 text-sm">Regularize sua situação para solicitar novos chamados.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center animate-fade-in">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 font-display mb-3">Chamado Enviado!</h2>
        <p className="text-slate-500 mb-2">
          Seu pedido foi recebido. Nossa equipe entrará em contato para confirmar o agendamento.
        </p>
        <p className="text-xs text-slate-400 mb-8">O administrador foi notificado e acompanha seu chamado.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => router.push("/client/requests")} className="btn-primary">Ver meus chamados</button>
          <button onClick={() => { setSubmitted(false); setDescription(""); setDesiredDate(""); }} className="btn-secondary">
            Novo chamado
          </button>
        </div>
      </div>
    );
  }

  const noServicesAvailable = !loadingRules && availableRules.length === 0;
  const canSubmit = !!selectedRule && !createMutation.isPending;

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/client/dashboard" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-display">Solicitar Serviço</h1>
          <p className="text-slate-500 text-sm">Selecione o tipo e preencha os detalhes</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 p-4 rounded-xl border-2 border-brand-500 bg-brand-50 text-left">
          <Wrench className="w-6 h-6 mb-2 text-brand-600" />
          <p className="text-sm font-semibold text-slate-900">Serviço</p>
          <p className="text-xs text-slate-500">Reparo doméstico</p>
        </div>
        <Link href="/client/requests/new/coverage" className="flex-1 p-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 text-left transition-all">
          <span className="text-2xl mb-2 block">🛡️</span>
          <p className="text-sm font-semibold text-slate-900">Cobertura</p>
          <p className="text-xs text-slate-500">Sinistro / dano</p>
        </Link>
      </div>

      {plan && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">
            Plano contratado: <span className="text-brand-700">{plan.name}</span>
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Os limites abaixo refletem as regras configuradas para este plano.
          </p>
        </div>
      )}

      {noServicesAvailable ? (
        <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 text-center">
          <p className="text-sm font-semibold text-amber-800">
            Nenhum serviço está habilitado no seu plano no momento.
          </p>
          <p className="text-xs text-amber-700 mt-1">
            Entre em contato com seu supervisor para mais informações.
          </p>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (canSubmit) createMutation.mutate(); }}
          className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div>
            <label className="form-label">Tipo de Serviço *</label>
            {loadingRules ? (
              <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {availableRules.map((rule) => (
                  <button
                    key={rule.serviceId}
                    type="button"
                    onClick={() => setServiceId(rule.serviceId)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      serviceId === rule.serviceId
                        ? "border-brand-400 bg-brand-50 text-brand-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <span>{rule.serviceIcon ?? "🛠️"}</span>
                    {rule.serviceName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedRule && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-xs font-semibold text-emerald-800 mb-1">
                Regras deste serviço no seu plano:
              </p>
              <ul className="text-xs text-emerald-700 space-y-0.5">
                <li>
                  • Por mês:{" "}
                  <strong>
                    {selectedRule.maxPerMonth === -1 ? "ilimitado" : selectedRule.maxPerMonth}
                  </strong>
                </li>
                <li>
                  • Por ano:{" "}
                  <strong>
                    {selectedRule.maxPerYear === -1 ? "ilimitado" : selectedRule.maxPerYear}
                  </strong>
                </li>
                <li>
                  • Cobertura por chamado:{" "}
                  <strong>{formatCurrency(selectedRule.coverageLimit)}</strong>
                </li>
              </ul>
            </div>
          )}

          <div>
            <label className="form-label">Descrição do Problema *</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
              placeholder="Descreva o problema com detalhes..." className="form-input resize-none" />
          </div>
          <div>
            <label className="form-label">Data Desejada para Atendimento *</label>
            <input type="date" required value={desiredDate} onChange={(e) => setDesiredDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]} className="form-input" />
          </div>
          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-primary w-full justify-center py-3.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            {createMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
            Enviar Solicitação de Serviço
          </button>
        </form>
      )}
    </div>
  );
}
