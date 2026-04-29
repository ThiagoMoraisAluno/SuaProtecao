"use client";
import { PageSkeleton } from "@/components/ui/PageSkeleton";

import { useState } from "react";
import { Edit2, Check, X, Shield, Plus, Trash2, ListChecks } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { plansService } from "@/services/plans.service";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { PlanRulesModal } from "@/components/features/PlanRulesModal";
import type { Plan, PlanType, BillingCycle } from "@/types";

const planColors: Record<string, string> = {
  basic: "from-slate-500 to-slate-700",
  intermediate: "from-brand-500 to-brand-700",
  premium: "from-violet-500 to-violet-800",
};

type NewPlanForm = {
  type: PlanType;
  name: string;
  price: string;
  servicesPerMonth: string;
  coverageLimit: string;
  features: string;
  color: string;
  billingCycle: BillingCycle;
  popular: boolean;
};

const EMPTY_NEW_PLAN: NewPlanForm = {
  type: "basic",
  name: "",
  price: "",
  servicesPerMonth: "1",
  coverageLimit: "",
  features: "",
  color: "brand",
  billingCycle: "monthly",
  popular: false,
};

export default function AdminPlansPage() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Plan>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [newPlan, setNewPlan] = useState<NewPlanForm>(EMPTY_NEW_PLAN);
  const [rulesPlan, setRulesPlan] = useState<Plan | null>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: () => plansService.findAll(),
  });

  const updateMutation = useMutation({
    mutationFn: (plan: Plan) => plansService.update(plan.id, plan),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plans"] });
      setEditingId(null);
      toast.success("Plano atualizado com sucesso!");
    },
    onError: () => toast.error("Erro ao atualizar plano."),
  });

  const createMutation = useMutation({
    mutationFn: (input: Omit<Plan, "id">) => plansService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plans"] });
      setShowCreate(false);
      setNewPlan(EMPTY_NEW_PLAN);
      toast.success("Plano criado com sucesso!");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Erro ao criar plano."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => plansService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plano excluído com sucesso!");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Erro ao excluir plano."),
  });

  const startEdit = (plan: Plan) => {
    setEditingId(plan.id);
    setEditForm({ ...plan });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (!editForm.id) return;
    updateMutation.mutate(editForm as Plan);
  };

  const submitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const features = newPlan.features
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);
    if (features.length === 0) {
      toast.error("Inclua ao menos um item em 'Inclui'.");
      return;
    }
    createMutation.mutate({
      type: newPlan.type,
      name: newPlan.name,
      price: Number(newPlan.price),
      servicesPerMonth: Number(newPlan.servicesPerMonth),
      coverageLimit: Number(newPlan.coverageLimit),
      features,
      color: newPlan.color,
      billingCycle: newPlan.billingCycle,
      popular: newPlan.popular,
    });
  };

  const handleDelete = (plan: Plan) => {
    const ok = window.confirm(
      `Excluir o plano "${plan.name}"? A operação só prossegue se não houver clientes vinculados.`,
    );
    if (!ok) return;
    deleteMutation.mutate(plan.id);
  };

  if (isLoading) {
    return (
      <PageSkeleton />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Gerenciar Planos</h1>
          <p className="text-slate-500 text-sm mt-1">Configure valores e coberturas dos planos de assinatura</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus size={18} /> Novo Plano
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isEditing = editingId === plan.id;
          const displayPlan = isEditing ? (editForm as Plan) : plan;

          return (
            <div key={plan.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className={`bg-gradient-to-br ${planColors[plan.id] || planColors[plan.type] || "from-slate-500 to-slate-700"} p-6 text-white`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-white/70 mb-1">Plano</p>
                    {isEditing ? (
                      <input type="text" value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="text-lg font-bold bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-white focus:outline-none w-full" />
                    ) : (
                      <h3 className="text-lg font-bold font-display">{plan.name}</h3>
                    )}
                  </div>
                  {plan.popular && (
                    <span className="bg-white/20 border border-white/30 text-white text-xs font-semibold px-2 py-1 rounded-full ml-2">Popular</span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-white/70 mb-1">
                    {plan.billingCycle === "annual" ? "Anuidade" : "Mensalidade"}
                  </p>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <span className="text-white/80 font-bold">R$</span>
                      <input type="number" min="0" step="0.01" value={editForm.price || ""}
                        onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                        className="text-2xl font-bold bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-white focus:outline-none w-full" />
                    </div>
                  ) : (
                    <p className="text-3xl font-bold font-display">{formatCurrency(plan.price)}</p>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-brand-600" />
                    <span className="text-sm font-medium text-slate-700">Cobertura máxima</span>
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-500">R$</span>
                      <input type="number" min="0" step="1000" value={editForm.coverageLimit || ""}
                        onChange={(e) => setEditForm({ ...editForm, coverageLimit: Number(e.target.value) })}
                        className="text-sm font-bold border border-slate-200 rounded-lg px-2 py-1 w-28 text-right focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-emerald-600">{formatCurrency(plan.coverageLimit)}</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔧</span>
                    <span className="text-sm font-medium text-slate-700">Serviços/mês</span>
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input type="number" min="-1"
                        value={editForm.servicesPerMonth === undefined ? plan.servicesPerMonth : editForm.servicesPerMonth}
                        onChange={(e) => setEditForm({ ...editForm, servicesPerMonth: Number(e.target.value) })}
                        className="text-sm font-bold border border-slate-200 rounded-lg px-2 py-1 w-20 text-center focus:outline-none focus:ring-2 focus:ring-brand-500" />
                      <span className="text-xs text-slate-400">(-1=∞)</span>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-slate-900">
                      {plan.servicesPerMonth === -1 ? "Ilimitado" : plan.servicesPerMonth}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <span className="text-sm font-medium text-slate-700">Ciclo de cobrança</span>
                  {isEditing ? (
                    <select
                      value={editForm.billingCycle ?? plan.billingCycle ?? "monthly"}
                      onChange={(e) => setEditForm({ ...editForm, billingCycle: e.target.value as BillingCycle })}
                      className="text-sm font-bold border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="monthly">Mensal</option>
                      <option value="annual">Anual</option>
                    </select>
                  ) : (
                    <span className="text-sm font-bold text-slate-900">
                      {plan.billingCycle === "annual" ? "Anual" : "Mensal"}
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">Inclui</p>
                  <ul className="space-y-2">
                    {displayPlan.features?.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {isEditing ? (
                          <input type="text" value={f}
                            onChange={(e) => {
                              const features = [...(editForm.features || plan.features)];
                              features[i] = e.target.value;
                              setEditForm({ ...editForm, features });
                            }}
                            className="flex-1 border-b border-slate-200 focus:border-brand-500 focus:outline-none text-sm py-0.5" />
                        ) : (
                          <span>{f}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-50">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <button onClick={cancelEdit} className="btn-secondary flex-1 justify-center py-2.5">
                        <X size={16} /> Cancelar
                      </button>
                      <button onClick={saveEdit} disabled={updateMutation.isPending} className="btn-primary flex-1 justify-center py-2.5">
                        {updateMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
                        Salvar
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setRulesPlan(plan)} className="btn-outline flex-1 justify-center py-2.5">
                        <ListChecks size={16} /> Serviços
                      </button>
                      <button onClick={() => startEdit(plan)} className="btn-secondary justify-center py-2.5" aria-label="Editar plano">
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(plan)}
                        disabled={deleteMutation.isPending}
                        className="btn-secondary justify-center py-2.5 text-red-600 hover:bg-red-50 hover:border-red-200"
                        aria-label="Excluir plano"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div>
          <p className="text-sm font-semibold text-amber-800">Atenção ao alterar planos</p>
          <p className="text-sm text-amber-700 mt-1">
            Alterações nos planos afetam novos clientes. Clientes existentes mantêm as condições atuais até renovação.
            Exclusão só é permitida quando o plano não tem nenhum cliente vinculado.
          </p>
        </div>
      </div>

      {rulesPlan && (
        <PlanRulesModal plan={rulesPlan} onClose={() => setRulesPlan(null)} />
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 font-display">Novo Plano</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Tipo</label>
                  <select
                    value={newPlan.type}
                    onChange={(e) => setNewPlan({ ...newPlan, type: e.target.value as PlanType })}
                    className="form-input"
                    required
                  >
                    <option value="basic">Básico</option>
                    <option value="intermediate">Intermediário</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Nome</label>
                  <input
                    type="text"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    className="form-input"
                    minLength={3}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Preço (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Ciclo</label>
                  <select
                    value={newPlan.billingCycle}
                    onChange={(e) => setNewPlan({ ...newPlan, billingCycle: e.target.value as BillingCycle })}
                    className="form-input"
                  >
                    <option value="monthly">Mensal</option>
                    <option value="annual">Anual</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Serviços/mês (-1 = ilimitado)</label>
                  <input
                    type="number"
                    min="-1"
                    value={newPlan.servicesPerMonth}
                    onChange={(e) => setNewPlan({ ...newPlan, servicesPerMonth: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Cobertura máxima (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={newPlan.coverageLimit}
                    onChange={(e) => setNewPlan({ ...newPlan, coverageLimit: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Cor (tema)</label>
                  <input
                    type="text"
                    value={newPlan.color}
                    onChange={(e) => setNewPlan({ ...newPlan, color: e.target.value })}
                    className="form-input"
                    placeholder="brand, slate, navy…"
                  />
                </div>

                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={newPlan.popular}
                      onChange={(e) => setNewPlan({ ...newPlan, popular: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    Marcar como Popular
                  </label>
                </div>
              </div>

              <div>
                <label className="form-label">Inclui (uma feature por linha)</label>
                <textarea
                  rows={5}
                  value={newPlan.features}
                  onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })}
                  className="form-input"
                  placeholder={"1 serviço por mês\nCobertura até R$ 20.000\nSuporte via WhatsApp"}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn-primary"
                >
                  {createMutation.isPending ? "Criando…" : "Criar Plano"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
