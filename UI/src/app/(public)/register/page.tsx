"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, ArrowRight, Loader2, Check, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { plansService } from "@/services/plans.service";
import { authService } from "@/services/auth.service";
import { formatCurrency } from "@/lib/utils";
import { APPLIANCES_LIST, BRAZILIAN_STATES } from "@/constants";
import { toast } from "sonner";
import type { Plan } from "@/types";

type Step = 1 | 2 | 3 | 4;

interface FormData {
  name: string; cpf: string; email: string; phone: string;
  password: string; confirmPassword: string;
  zipCode: string; state: string; street: string; number: string;
  complement: string; neighborhood: string; city: string;
  planId: string;
  selectedAppliances: Record<string, boolean>;
  applianceValues: Record<string, string>;
}

const defaultForm: FormData = {
  name: "", cpf: "", email: "", phone: "", password: "", confirmPassword: "",
  zipCode: "", state: "SP", street: "", number: "", complement: "", neighborhood: "", city: "",
  planId: "intermediate",
  selectedAppliances: {},
  applianceValues: {},
};

const STEP_LABELS = ["Dados Pessoais", "Endereço", "Plano", "Bens do Imóvel"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    plansService.findAll().then(setPlans).catch(() => {});
  }, []);

  const set = (field: keyof FormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const selectedPlan = useMemo(() => plans.find((p) => p.id === form.planId), [form.planId, plans]);

  const totalAssetsValue = useMemo(() => {
    return Object.entries(form.selectedAppliances)
      .filter(([, sel]) => sel)
      .reduce((sum, [name]) => sum + (Number(form.applianceValues[name]) || 0), 0);
  }, [form.selectedAppliances, form.applianceValues]);

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("A senha deve ter pelo menos 6 caracteres."); return; }
    if (form.password !== form.confirmPassword) { toast.error("As senhas não conferem."); return; }
    setStep(2);
  };

  const handleStep2 = (e: React.FormEvent) => { e.preventDefault(); setStep(3); };
  const handleStep3 = (e: React.FormEvent) => { e.preventDefault(); setStep(4); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const assets = Object.entries(form.selectedAppliances)
        .filter(([, sel]) => sel)
        .map(([name]) => ({ name, estimatedValue: Number(form.applianceValues[name]) || 0 }));

      await authService.register({
        name: form.name,
        email: form.email,
        password: form.password,
        cpf: form.cpf,
        phone: form.phone,
        planId: form.planId,
        address: {
          street: form.street,
          number: form.number,
          complement: form.complement,
          neighborhood: form.neighborhood,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
        },
        assets,
      });
      setDone(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(
        typeof msg === "string"
          ? msg
          : Array.isArray(msg)
          ? msg[0]
          : "Erro ao criar conta. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center animate-fade-in">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-display mb-3">Conta Criada!</h2>
          <p className="text-slate-500 text-sm mb-2">
            Seu cadastro foi concluído com sucesso. Você já pode acessar o sistema.
          </p>
          <p className="text-xs text-slate-400 mb-8">
            Um supervisor será atribuído pela nossa equipe em breve.
          </p>
          <button onClick={() => router.push("/login")} className="btn-primary w-full justify-center py-3.5">
            Ir para o Login
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 flex items-center justify-center p-4 py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white font-display leading-tight">Criar nova conta</h1>
                <p className="text-brand-200 text-xs">Sua Proteção | Reparo Certo</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {STEP_LABELS.map((label, idx) => {
                const s = (idx + 1) as Step;
                const isActive = step === s;
                const isDone = step > s;
                return (
                  <div key={s} className="flex items-center gap-1.5 flex-1 min-w-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                      isDone ? "bg-emerald-400 text-white" :
                      isActive ? "bg-white text-brand-700" :
                      "bg-white/20 text-white/60"
                    }`}>
                      {isDone ? <Check size={13} /> : s}
                    </div>
                    <span className={`text-xs font-medium truncate ${isActive ? "text-white" : "text-white/50"}`}>
                      {label}
                    </span>
                    {idx < STEP_LABELS.length - 1 && (
                      <div className={`flex-1 h-px min-w-[8px] ${isDone ? "bg-emerald-400" : "bg-white/20"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-8 py-8">
            {step === 1 && (
              <form onSubmit={handleStep1} className="space-y-6 animate-fade-in">
                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 text-xs font-bold">1</span>
                  Dados Pessoais
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="form-label">Nome Completo *</label>
                    <input type="text" required value={form.name} onChange={(e) => set("name", e.target.value)} className="form-input" placeholder="Nome completo" /></div>
                  <div><label className="form-label">CPF *</label>
                    <input type="text" required value={form.cpf} onChange={(e) => set("cpf", e.target.value)} className="form-input" placeholder="000.000.000-00" /></div>
                  <div><label className="form-label">E-mail *</label>
                    <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} className="form-input" placeholder="email@exemplo.com" /></div>
                  <div><label className="form-label">Telefone</label>
                    <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="form-input" placeholder="(00) 00000-0000" /></div>
                  <div><label className="form-label">Senha *</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} required minLength={6} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Mínimo 6 caracteres" className="form-input pr-12" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>
                  <div><label className="form-label">Confirmar Senha *</label>
                    <div className="relative">
                      <input type={showConfirm ? "text" : "password"} required value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} placeholder="Repita a senha" className="form-input pr-12" />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {form.confirmPassword && form.password !== form.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">As senhas não conferem</p>
                    )}
                  </div>
                </div>
                <button type="submit" className="w-full btn-primary justify-center py-3.5">
                  Próximo — Endereço <ArrowRight size={18} />
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleStep2} className="space-y-6 animate-fade-in">
                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 text-xs font-bold">2</span>
                  Endereço Residencial
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="form-label">CEP *</label>
                    <input type="text" required value={form.zipCode} onChange={(e) => set("zipCode", e.target.value)} className="form-input" placeholder="00000-000" /></div>
                  <div><label className="form-label">Estado *</label>
                    <select required value={form.state} onChange={(e) => set("state", e.target.value)} className="form-select">
                      {BRAZILIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select></div>
                  <div className="sm:col-span-2"><label className="form-label">Rua / Logradouro *</label>
                    <input type="text" required value={form.street} onChange={(e) => set("street", e.target.value)} className="form-input" placeholder="Nome da rua" /></div>
                  <div><label className="form-label">Número *</label>
                    <input type="text" required value={form.number} onChange={(e) => set("number", e.target.value)} className="form-input" placeholder="123" /></div>
                  <div><label className="form-label">Complemento</label>
                    <input type="text" value={form.complement} onChange={(e) => set("complement", e.target.value)} className="form-input" placeholder="Apto, sala, etc." /></div>
                  <div><label className="form-label">Bairro *</label>
                    <input type="text" required value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} className="form-input" placeholder="Bairro" /></div>
                  <div><label className="form-label">Cidade *</label>
                    <input type="text" required value={form.city} onChange={(e) => set("city", e.target.value)} className="form-input" placeholder="Cidade" /></div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary px-5"><ChevronLeft size={18} /></button>
                  <button type="submit" className="flex-1 btn-primary justify-center py-3.5">Próximo — Escolher Plano <ArrowRight size={18} /></button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleStep3} className="space-y-6 animate-fade-in">
                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 text-xs font-bold">3</span>
                  Plano Escolhido
                </h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  {plans.map((plan) => (
                    <button key={plan.id} type="button" onClick={() => set("planId", plan.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all relative ${form.planId === plan.id ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-slate-300 bg-white"}`}>
                      {plan.popular && <span className="absolute top-2 right-2 bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">POPULAR</span>}
                      <p className="text-sm font-semibold text-slate-900 pr-10">{plan.name}</p>
                      <p className="text-xl font-bold text-brand-600 mt-1">{formatCurrency(plan.price)}<span className="text-xs font-normal text-slate-400">/mês</span></p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {plan.servicesPerMonth === -1 ? "Ilimitado" : `${plan.servicesPerMonth} serv./mês`} · Cobertura {formatCurrency(plan.coverageLimit)}
                      </p>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary px-5"><ChevronLeft size={18} /></button>
                  <button type="submit" className="flex-1 btn-primary justify-center py-3.5">Próximo — Bens do Imóvel <ArrowRight size={18} /></button>
                </div>
              </form>
            )}

            {step === 4 && (
              <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 text-xs font-bold">4</span>
                    Bens do Imóvel (Checklist)
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 ml-8">Selecione os bens e informe o valor estimado</p>
                  <div className="grid sm:grid-cols-2 gap-2 mb-4">
                    {APPLIANCES_LIST.map((appliance) => {
                      const checked = !!form.selectedAppliances[appliance];
                      return (
                        <label key={appliance} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checked ? "border-brand-300 bg-brand-50" : "border-slate-100 hover:border-slate-200"}`}>
                          <input type="checkbox" checked={checked}
                            onChange={(e) => set("selectedAppliances", { ...form.selectedAppliances, [appliance]: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 flex-shrink-0" />
                          <span className="text-sm text-slate-700 flex-1">{appliance}</span>
                          {checked && (
                            <input type="number" min="0" placeholder="R$"
                              value={form.applianceValues[appliance] || ""}
                              onChange={(e) => set("applianceValues", { ...form.applianceValues, [appliance]: e.target.value })}
                              onClick={(e) => e.stopPropagation()}
                              className="w-24 text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-right focus:outline-none focus:ring-2 focus:ring-brand-500 flex-shrink-0" />
                          )}
                        </label>
                      );
                    })}
                  </div>

                  {selectedPlan && (
                    <div className={`p-4 rounded-xl border ${totalAssetsValue > selectedPlan.coverageLimit ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Valor Total dos Bens</p>
                          <p className="text-xs text-slate-500 mt-0.5">Limite de cobertura: {formatCurrency(selectedPlan.coverageLimit)}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold font-display ${totalAssetsValue > selectedPlan.coverageLimit ? "text-red-600" : "text-emerald-600"}`}>
                            {formatCurrency(totalAssetsValue)}
                          </p>
                          {totalAssetsValue > selectedPlan.coverageLimit && (
                            <p className="text-xs text-red-600 mt-0.5">⚠️ Acima do limite do plano</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(3)} className="btn-secondary px-5"><ChevronLeft size={18} /></button>
                  <button type="submit" disabled={loading} className="flex-1 btn-primary justify-center py-3.5">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check size={18} />}
                    {loading ? "Criando conta..." : "Criar Minha Conta"}
                  </button>
                </div>
              </form>
            )}

            <p className="text-center text-sm text-slate-500 mt-6">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                Entrar
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-5">
          <Link href="/" className="text-sm text-white/50 hover:text-white transition-colors">
            ← Voltar para o site
          </Link>
        </div>
      </div>
    </div>
  );
}
