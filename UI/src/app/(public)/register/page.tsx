"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Shield, ArrowRight, Loader2, Check, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { plansService } from "@/services/plans.service";
import { authService } from "@/services/auth.service";
import { formatCurrency } from "@/lib/utils";
import { APPLIANCES_LIST, BRAZILIAN_STATES } from "@/constants";
import { toast } from "sonner";
import axios from "axios";

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z
  .object({
    name:            z.string().min(1, "Nome é obrigatório"),
    cpf:             z.string().min(11, "CPF inválido"),
    email:           z.string().email("E-mail inválido"),
    phone:           z.string().default(""),
    password:        z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string(),
    zipCode:         z.string().min(8, "CEP inválido"),
    state:           z.string().min(2, "Estado obrigatório"),
    street:          z.string().min(1, "Rua obrigatória"),
    number:          z.string().min(1, "Número obrigatório"),
    complement:      z.string().default(""),
    neighborhood:    z.string().min(1, "Bairro obrigatório"),
    city:            z.string().min(1, "Cidade obrigatória"),
    planId:          z.string().min(1, "Selecione um plano"),
    selectedAppliances: z.record(z.string(), z.boolean()).default({}),
    applianceValues:    z.record(z.string(), z.string()).default({}),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof schema>;

// Campos validados por etapa
const STEP_FIELDS: Record<number, (keyof RegisterForm)[]> = {
  1: ["name", "cpf", "email", "password", "confirmPassword"],
  2: ["zipCode", "state", "street", "number", "neighborhood", "city"],
  3: ["planId"],
};

const STEP_LABELS = ["Dados Pessoais", "Endereço", "Plano", "Bens do Imóvel"];

// ── Componente ────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const { data: plans = [] } = useQuery({
    queryKey: ["plans"],
    queryFn: () => plansService.findAll(),
  });

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "", cpf: "", email: "", phone: "",
      password: "", confirmPassword: "",
      zipCode: "", state: "SP", street: "", number: "",
      complement: "", neighborhood: "", city: "",
      planId: "",
      selectedAppliances: {},
      applianceValues: {},
    },
  });

  const selectedAppliances = watch("selectedAppliances");
  const applianceValues    = watch("applianceValues");
  const planId             = watch("planId");
  const password           = watch("password");
  const confirmPassword    = watch("confirmPassword");

  const selectedPlan = plans.find((p) => p.id === planId);

  const totalAssetsValue = Object.entries(selectedAppliances)
    .filter(([, sel]) => sel)
    .reduce((sum, [name]) => sum + (Number(applianceValues[name]) || 0), 0);

  const goNext = async () => {
    const fields = STEP_FIELDS[step];
    const valid = await trigger(fields);
    if (valid) setStep((s) => s + 1);
  };

  const onSubmit = async (data: RegisterForm) => {
    try {
      const assets = Object.entries(data.selectedAppliances)
        .filter(([, sel]) => sel)
        .map(([name]) => ({
          name,
          estimatedValue: Number(data.applianceValues[name]) || 0,
        }));

      await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        cpf: data.cpf,
        phone: data.phone,
        planId: data.planId,
        address: {
          street: data.street,
          number: data.number,
          complement: data.complement,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
        },
        assets,
      });
      setDone(true);
    } catch (err) {
      const apiMsg = axios.isAxiosError<{ message: string | string[] }>(err)
        ? err.response?.data?.message
        : undefined;
      toast.error(
        typeof apiMsg === "string"
          ? apiMsg
          : Array.isArray(apiMsg)
          ? apiMsg[0]
          : "Erro ao criar conta. Tente novamente."
      );
    }
  };

  // ── Tela de sucesso ──────────────────────────────────────────────────────────

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
            Ir para o Login <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // ── Formulário multi-step ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 flex items-center justify-center p-4 py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Header com steps */}
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
                const s = idx + 1;
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

          {/* Conteúdo dos steps */}
          <div className="px-8 py-8">

            {/* Step 1 — Dados Pessoais */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <StepTitle step={1} label="Dados Pessoais" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Nome Completo *" error={errors.name?.message}>
                    <input {...register("name")} type="text" className="form-input" placeholder="Nome completo" />
                  </Field>
                  <Field label="CPF *" error={errors.cpf?.message}>
                    <input {...register("cpf")} type="text" className="form-input" placeholder="000.000.000-00" />
                  </Field>
                  <Field label="E-mail *" error={errors.email?.message}>
                    <input {...register("email")} type="email" className="form-input" placeholder="email@exemplo.com" />
                  </Field>
                  <Field label="Telefone" error={errors.phone?.message}>
                    <input {...register("phone")} type="tel" className="form-input" placeholder="(00) 00000-0000" />
                  </Field>
                  <Field label="Senha *" error={errors.password?.message}>
                    <div className="relative">
                      <input {...register("password")} type={showPassword ? "text" : "password"} className="form-input pr-12" placeholder="Mínimo 6 caracteres" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </Field>
                  <Field label="Confirmar Senha *" error={errors.confirmPassword?.message}>
                    <div className="relative">
                      <input {...register("confirmPassword")} type={showConfirm ? "text" : "password"} className="form-input pr-12" placeholder="Repita a senha" />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {!errors.confirmPassword && confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">As senhas não conferem</p>
                    )}
                  </Field>
                </div>
                <button type="button" onClick={goNext} className="w-full btn-primary justify-center py-3.5">
                  Próximo — Endereço <ArrowRight size={18} />
                </button>
              </div>
            )}

            {/* Step 2 — Endereço */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <StepTitle step={2} label="Endereço Residencial" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="CEP *" error={errors.zipCode?.message}>
                    <input {...register("zipCode")} type="text" className="form-input" placeholder="00000-000" />
                  </Field>
                  <Field label="Estado *" error={errors.state?.message}>
                    <select {...register("state")} className="form-select">
                      {BRAZILIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Rua / Logradouro *" error={errors.street?.message}>
                      <input {...register("street")} type="text" className="form-input" placeholder="Nome da rua" />
                    </Field>
                  </div>
                  <Field label="Número *" error={errors.number?.message}>
                    <input {...register("number")} type="text" className="form-input" placeholder="123" />
                  </Field>
                  <Field label="Complemento" error={errors.complement?.message}>
                    <input {...register("complement")} type="text" className="form-input" placeholder="Apto, sala, etc." />
                  </Field>
                  <Field label="Bairro *" error={errors.neighborhood?.message}>
                    <input {...register("neighborhood")} type="text" className="form-input" placeholder="Bairro" />
                  </Field>
                  <Field label="Cidade *" error={errors.city?.message}>
                    <input {...register("city")} type="text" className="form-input" placeholder="Cidade" />
                  </Field>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary px-5"><ChevronLeft size={18} /></button>
                  <button type="button" onClick={goNext} className="flex-1 btn-primary justify-center py-3.5">
                    Próximo — Escolher Plano <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Plano */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <StepTitle step={3} label="Plano Escolhido" />
                {errors.planId && <p className="text-xs text-red-500">{errors.planId.message}</p>}
                <div className="grid sm:grid-cols-3 gap-3">
                  {plans.map((plan) => (
                    <button key={plan.id} type="button" onClick={() => setValue("planId", plan.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all relative ${planId === plan.id ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-slate-300 bg-white"}`}>
                      {plan.popular && (
                        <span className="absolute top-2 right-2 bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">POPULAR</span>
                      )}
                      <p className="text-sm font-semibold text-slate-900 pr-10">{plan.name}</p>
                      <p className="text-xl font-bold text-brand-600 mt-1">
                        {formatCurrency(plan.price)}<span className="text-xs font-normal text-slate-400">/mês</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {plan.servicesPerMonth === -1 ? "Ilimitado" : `${plan.servicesPerMonth} serv./mês`} · Cobertura {formatCurrency(plan.coverageLimit)}
                      </p>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary px-5"><ChevronLeft size={18} /></button>
                  <button type="button" onClick={goNext} className="flex-1 btn-primary justify-center py-3.5">
                    Próximo — Bens do Imóvel <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 — Bens */}
            {step === 4 && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-fade-in">
                <div>
                  <StepTitle step={4} label="Bens do Imóvel (Checklist)" />
                  <p className="text-xs text-slate-500 mb-4 ml-8">Selecione os bens e informe o valor estimado</p>
                  <div className="grid sm:grid-cols-2 gap-2 mb-4">
                    {APPLIANCES_LIST.map((appliance) => {
                      const checked = !!selectedAppliances[appliance];
                      return (
                        <label key={appliance} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checked ? "border-brand-300 bg-brand-50" : "border-slate-100 hover:border-slate-200"}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => setValue("selectedAppliances", { ...selectedAppliances, [appliance]: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 flex-shrink-0"
                          />
                          <span className="text-sm text-slate-700 flex-1">{appliance}</span>
                          {checked && (
                            <input
                              type="number"
                              min="0"
                              placeholder="R$"
                              value={applianceValues[appliance] ?? ""}
                              onChange={(e) => setValue("applianceValues", { ...applianceValues, [appliance]: e.target.value })}
                              onClick={(e) => e.stopPropagation()}
                              className="w-24 text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-right focus:outline-none focus:ring-2 focus:ring-brand-500 flex-shrink-0"
                            />
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
                  <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary justify-center py-3.5">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check size={18} />}
                    {isSubmitting ? "Criando conta..." : "Criar Minha Conta"}
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

// ── Auxiliares ────────────────────────────────────────────────────────────────

function StepTitle({ step, label }: { step: number; label: string }) {
  return (
    <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
      <span className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 text-xs font-bold">
        {step}
      </span>
      {label}
    </h3>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
