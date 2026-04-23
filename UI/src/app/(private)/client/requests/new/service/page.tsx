"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ArrowLeft, Wrench } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { clientsService } from "@/services/clients.service";
import { plansService } from "@/services/plans.service";
import { requestsService } from "@/services/requests.service";
import { SERVICE_TYPES } from "@/constants";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function NewServiceRequestPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [serviceType, setServiceType] = useState("plumber");
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

  const plan = plans.find((p) => p.id === client?.planId);

  const createMutation = useMutation({
    mutationFn: () =>
      requestsService.createService({ serviceType: serviceType as any, description, desiredDate }),
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Chamado de serviço enviado com sucesso!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Erro ao enviar chamado.");
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

  const servicesAvailable = plan
    ? plan.servicesPerMonth === -1 || (client ? client.servicesUsedThisMonth < plan.servicesPerMonth : false)
    : false;

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
        <div className={`p-4 rounded-xl ${servicesAvailable ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
          <p className={`text-sm font-semibold ${servicesAvailable ? "text-emerald-800" : "text-red-800"}`}>
            {plan.servicesPerMonth === -1
              ? "✅ Serviços ilimitados no seu plano"
              : servicesAvailable
                ? `✅ ${plan.servicesPerMonth - (client?.servicesUsedThisMonth || 0)} serviço(s) disponível(is) este mês`
                : `❌ Limite mensal de ${plan.servicesPerMonth} serviço(s) atingido`}
          </p>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
        className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="form-label">Tipo de Serviço *</label>
          <div className="grid grid-cols-2 gap-2">
            {SERVICE_TYPES.map((st) => (
              <button key={st.value} type="button" onClick={() => setServiceType(st.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  serviceType === st.value ? "border-brand-400 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}>
                <span>{st.icon}</span>{st.label}
              </button>
            ))}
          </div>
        </div>
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
        <button type="submit" disabled={!servicesAvailable || createMutation.isPending}
          className="btn-primary w-full justify-center py-3.5 disabled:opacity-50 disabled:pointer-events-none">
          {createMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
          Enviar Solicitação de Serviço
        </button>
      </form>
    </div>
  );
}
