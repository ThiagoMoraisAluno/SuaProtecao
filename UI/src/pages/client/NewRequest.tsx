import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, ArrowLeft, Wrench, Shield, Upload } from "lucide-react";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { useAuth } from "@/contexts/AuthContext";
import { fetchClientById, fetchPlans, createRequest, incrementClientServices } from "@/lib/api";
import { SERVICE_TYPES, COVERAGE_TYPES } from "@/constants";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import type { Client, Plan } from "@/types";

export function ClientNewRequest() {
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get("type") === "coverage" ? "coverage" : "service";
  const [requestType, setRequestType] = useState<"service" | "coverage">(defaultType);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [client, setClient] = useState<Client | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  const [serviceType, setServiceType] = useState("plumber");
  const [serviceDesc, setServiceDesc] = useState("");
  const [desiredDate, setDesiredDate] = useState("");
  const [coverageType, setCoverageType] = useState("theft");
  const [coverageDesc, setCoverageDesc] = useState("");
  const [estimatedLoss, setEstimatedLoss] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([fetchClientById(user.id), fetchPlans()]).then(([c, plans]) => {
      setClient(c);
      if (c) setPlan(plans.find((p) => p.id === c.planId) || null);
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      </ClientLayout>
    );
  }

  if (!client || !plan) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-400">Dados não encontrados.</p>
        </div>
      </ClientLayout>
    );
  }

  if (client.status === "defaulter") {
    return (
      <ClientLayout>
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-bold text-red-800 mb-2">Conta Inadimplente</h2>
          <p className="text-red-700 text-sm">Regularize sua situação para solicitar novos chamados.</p>
        </div>
      </ClientLayout>
    );
  }

  const servicesAvailable = plan.servicesPerMonth === -1 || client.servicesUsedThisMonth < plan.servicesPerMonth;

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!servicesAvailable) {
      toast.error("Você atingiu o limite de serviços do seu plano este mês!");
      return;
    }
    setSubmitting(true);
    await createRequest({
      clientId: client.id,
      clientName: client.name,
      type: "service",
      serviceType: serviceType as any,
      description: serviceDesc,
      desiredDate,
      status: "pending",
    });
    await incrementClientServices(client.id);
    setSubmitted(true);
    toast.success("Chamado de serviço enviado com sucesso!");
    setSubmitting(false);
  };

  const handleCoverageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lossValue = Number(estimatedLoss);
    if (lossValue > plan.coverageLimit) {
      toast.warning(`Valor acima do limite de cobertura (${formatCurrency(plan.coverageLimit)})`);
    }
    setSubmitting(true);
    await createRequest({
      clientId: client.id,
      clientName: client.name,
      type: "coverage",
      coverageType: coverageType as any,
      description: coverageDesc,
      estimatedLoss: lossValue,
      evidenceUrls: [],
      status: "analyzing",
    });
    setSubmitted(true);
    toast.success("Chamado de cobertura enviado! Em análise.");
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <ClientLayout>
        <div className="max-w-lg mx-auto py-12 text-center animate-fade-in">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-display mb-3">Chamado Enviado!</h2>
          <p className="text-slate-500 mb-2">
            {requestType === "service"
              ? "Seu pedido foi recebido. Nossa equipe entrará em contato para confirmar o agendamento."
              : "Sua solicitação de cobertura está em análise. Você receberá uma resposta em breve."}
          </p>
          <p className="text-xs text-slate-400 mb-8">O administrador foi notificado e acompanha seu chamado.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate("/client/requests")} className="btn-primary">Ver meus chamados</button>
            <button onClick={() => { setSubmitted(false); setServiceDesc(""); setCoverageDesc(""); setEstimatedLoss(""); }} className="btn-secondary">
              Novo chamado
            </button>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/client")} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-display">Novo Chamado</h1>
            <p className="text-slate-500 text-sm">Selecione o tipo e preencha os detalhes</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setRequestType("service")}
            className={`p-4 rounded-xl border-2 text-left transition-all ${requestType === "service" ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}
          >
            <Wrench className={`w-6 h-6 mb-2 ${requestType === "service" ? "text-brand-600" : "text-slate-400"}`} />
            <p className="text-sm font-semibold text-slate-900">Serviço</p>
            <p className="text-xs text-slate-500">Reparo doméstico</p>
          </button>
          <button
            onClick={() => setRequestType("coverage")}
            className={`p-4 rounded-xl border-2 text-left transition-all ${requestType === "coverage" ? "border-purple-500 bg-purple-50" : "border-slate-200 hover:border-slate-300"}`}
          >
            <Shield className={`w-6 h-6 mb-2 ${requestType === "coverage" ? "text-purple-600" : "text-slate-400"}`} />
            <p className="text-sm font-semibold text-slate-900">Cobertura</p>
            <p className="text-xs text-slate-500">Sinistro / dano</p>
          </button>
        </div>

        {requestType === "service" && (
          <div className={`p-4 rounded-xl ${servicesAvailable ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
            <p className={`text-sm font-semibold ${servicesAvailable ? "text-emerald-800" : "text-red-800"}`}>
              {plan.servicesPerMonth === -1
                ? "✅ Serviços ilimitados no seu plano"
                : servicesAvailable
                  ? `✅ ${plan.servicesPerMonth - client.servicesUsedThisMonth} serviço(s) disponível(is) este mês`
                  : `❌ Limite mensal de ${plan.servicesPerMonth} serviço(s) atingido`}
            </p>
          </div>
        )}

        {requestType === "coverage" && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-purple-800">🛡️ Cobertura máxima do seu plano: {formatCurrency(plan.coverageLimit)}</p>
            <p className="text-xs text-purple-600 mt-1">O valor será analisado e aprovado pela nossa equipe.</p>
          </div>
        )}

        {requestType === "service" ? (
          <form onSubmit={handleServiceSubmit} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div>
              <label className="form-label">Tipo de Serviço *</label>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_TYPES.map((st) => (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => setServiceType(st.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      serviceType === st.value ? "border-brand-400 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <span>{st.icon}</span>{st.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="form-label">Descrição do Problema *</label>
              <textarea required value={serviceDesc} onChange={(e) => setServiceDesc(e.target.value)} rows={4} placeholder="Descreva o problema com detalhes..." className="form-input resize-none" />
            </div>
            <div>
              <label className="form-label">Data Desejada para Atendimento *</label>
              <input type="date" required value={desiredDate} onChange={(e) => setDesiredDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="form-input" />
            </div>
            <button type="submit" disabled={!servicesAvailable || submitting} className="btn-primary w-full justify-center py-3.5 disabled:opacity-50 disabled:pointer-events-none">
              {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
              Enviar Solicitação de Serviço
            </button>
          </form>
        ) : (
          <form onSubmit={handleCoverageSubmit} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div>
              <label className="form-label">Tipo de Ocorrência *</label>
              <div className="grid grid-cols-1 gap-2">
                {COVERAGE_TYPES.map((ct) => (
                  <button
                    key={ct.value}
                    type="button"
                    onClick={() => setCoverageType(ct.value)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                      coverageType === ct.value ? "border-purple-400 bg-purple-50 text-purple-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xl">{ct.icon}</span>{ct.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="form-label">Descrição do Ocorrido *</label>
              <textarea required value={coverageDesc} onChange={(e) => setCoverageDesc(e.target.value)} rows={4} placeholder="Descreva o ocorrido com detalhes..." className="form-input resize-none" />
            </div>
            <div>
              <label className="form-label">Valor Estimado do Prejuízo (R$) *</label>
              <input type="number" required min="1" step="0.01" value={estimatedLoss} onChange={(e) => setEstimatedLoss(e.target.value)} placeholder="0,00" className="form-input" />
              {estimatedLoss && Number(estimatedLoss) > plan.coverageLimit && (
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
            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3.5" style={{ background: "linear-gradient(to right, #7c3aed, #9333ea)" }}>
              {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
              Enviar Solicitação de Cobertura
            </button>
          </form>
        )}
      </div>
    </ClientLayout>
  );
}
