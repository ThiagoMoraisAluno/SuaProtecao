"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ArrowLeft, Shield, Upload } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { clientsService } from "@/services/clients.service";
import { plansService } from "@/services/plans.service";
import { requestsService } from "@/services/requests.service";
import { COVERAGE_TYPES } from "@/constants";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";
import type { CoverageType } from "@/types";

export default function NewCoverageRequestPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [coverageType, setCoverageType] = useState<CoverageType>("theft");
  const [description, setDescription] = useState("");
  const [estimatedLoss, setEstimatedLoss] = useState("");
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
      requestsService.createCoverage({
        coverageType,
        description,
        estimatedLoss: Number(estimatedLoss),
        evidenceUrls: [],
      }),
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Chamado de cobertura enviado! Em análise.");
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
          Sua solicitação de cobertura está em análise. Você receberá uma resposta em breve.
        </p>
        <p className="text-xs text-slate-400 mb-8">O administrador foi notificado e acompanha seu chamado.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => router.push("/client/requests")} className="btn-primary">Ver meus chamados</button>
          <button onClick={() => { setSubmitted(false); setDescription(""); setEstimatedLoss(""); }} className="btn-secondary">
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
          <h1 className="text-xl font-bold text-slate-900 font-display">Acionar Cobertura</h1>
          <p className="text-slate-500 text-sm">Informe o ocorrido com detalhes</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/client/requests/new/service"
          className="flex-1 p-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 text-left transition-all">
          <span className="text-2xl mb-2 block">🔧</span>
          <p className="text-sm font-semibold text-slate-900">Serviço</p>
          <p className="text-xs text-slate-500">Reparo doméstico</p>
        </Link>
        <div className="flex-1 p-4 rounded-xl border-2 border-purple-500 bg-purple-50 text-left">
          <Shield className="w-6 h-6 mb-2 text-purple-600" />
          <p className="text-sm font-semibold text-slate-900">Cobertura</p>
          <p className="text-xs text-slate-500">Sinistro / dano</p>
        </div>
      </div>

      {plan && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-purple-800">🛡️ Cobertura máxima do seu plano: {formatCurrency(plan.coverageLimit)}</p>
          <p className="text-xs text-purple-600 mt-1">O valor será analisado e aprovado pela nossa equipe.</p>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
        className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="form-label">Tipo de Ocorrência *</label>
          <div className="grid grid-cols-1 gap-2">
            {COVERAGE_TYPES.map((ct) => (
              <button key={ct.value} type="button" onClick={() => setCoverageType(ct.value)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                  coverageType === ct.value ? "border-purple-400 bg-purple-50 text-purple-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}>
                <span className="text-xl">{ct.icon}</span>{ct.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="form-label">Descrição do Ocorrido *</label>
          <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
            placeholder="Descreva o ocorrido com detalhes..." className="form-input resize-none" />
        </div>
        <div>
          <label className="form-label">Valor Estimado do Prejuízo (R$) *</label>
          <input type="number" required min="1" step="0.01" value={estimatedLoss}
            onChange={(e) => setEstimatedLoss(e.target.value)} placeholder="0,00" className="form-input" />
          {estimatedLoss && plan && Number(estimatedLoss) > plan.coverageLimit && (
            <p className="text-xs text-amber-600 mt-1.5">⚠️ Valor acima do limite de cobertura. A análise determinará o valor aprovado.</p>
          )}
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <div className="flex items-center gap-3 text-slate-500">
            <Upload size={20} />
            <div>
              <p className="text-sm font-medium text-slate-700">Fotos das evidências</p>
              <p className="text-xs text-slate-400">Upload disponível em breve</p>
            </div>
          </div>
        </div>
        <button type="submit" disabled={createMutation.isPending} className="btn-primary w-full justify-center py-3.5"
          style={{ background: "linear-gradient(to right, #7c3aed, #9333ea)" }}>
          {createMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
          Enviar Solicitação de Cobertura
        </button>
      </form>
    </div>
  );
}
