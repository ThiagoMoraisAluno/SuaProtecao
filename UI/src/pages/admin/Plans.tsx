import { useState, useEffect } from "react";
import { Edit2, Check, X, Shield } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { fetchPlans, updatePlan } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import type { Plan } from "@/types";

export function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Plan>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlans().then(setPlans).finally(() => setLoading(false));
  }, []);

  const startEdit = (plan: Plan) => {
    setEditingId(plan.id);
    setEditForm({ ...plan });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editForm.id) return;
    setSaving(true);
    await updatePlan(editForm as Plan);
    const updated = await fetchPlans();
    setPlans(updated);
    setEditingId(null);
    setSaving(false);
    toast.success("Plano atualizado com sucesso!");
  };

  const planColors: Record<string, string> = {
    basic: "from-slate-500 to-slate-700",
    intermediate: "from-brand-500 to-brand-700",
    premium: "from-violet-500 to-violet-800",
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Gerenciar Planos</h1>
          <p className="text-slate-500 text-sm mt-1">Configure valores e coberturas dos planos de assinatura</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isEditing = editingId === plan.id;
            const displayPlan = isEditing ? (editForm as Plan) : plan;

            return (
              <div key={plan.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className={`bg-gradient-to-br ${planColors[plan.id] || "from-slate-500 to-slate-700"} p-6 text-white`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-white/70 mb-1">Plano</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name || ""}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="text-lg font-bold bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-white focus:outline-none w-full"
                        />
                      ) : (
                        <h3 className="text-lg font-bold font-display">{plan.name}</h3>
                      )}
                    </div>
                    {plan.popular && (
                      <span className="bg-white/20 border border-white/30 text-white text-xs font-semibold px-2 py-1 rounded-full ml-2">Popular</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-white/70 mb-1">Mensalidade</p>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <span className="text-white/80 font-bold">R$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editForm.price || ""}
                          onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                          className="text-2xl font-bold bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-white focus:outline-none w-full"
                        />
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
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={editForm.coverageLimit || ""}
                          onChange={(e) => setEditForm({ ...editForm, coverageLimit: Number(e.target.value) })}
                          className="text-sm font-bold border border-slate-200 rounded-lg px-2 py-1 w-28 text-right focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
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
                        <input
                          type="number"
                          min="-1"
                          value={editForm.servicesPerMonth === undefined ? plan.servicesPerMonth : editForm.servicesPerMonth}
                          onChange={(e) => setEditForm({ ...editForm, servicesPerMonth: Number(e.target.value) })}
                          className="text-sm font-bold border border-slate-200 rounded-lg px-2 py-1 w-20 text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <span className="text-xs text-slate-400">(-1=∞)</span>
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-slate-900">
                        {plan.servicesPerMonth === -1 ? "Ilimitado" : plan.servicesPerMonth}
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
                            <input
                              type="text"
                              value={f}
                              onChange={(e) => {
                                const features = [...(editForm.features || plan.features)];
                                features[i] = e.target.value;
                                setEditForm({ ...editForm, features });
                              }}
                              className="flex-1 border-b border-slate-200 focus:border-brand-500 focus:outline-none text-sm py-0.5"
                            />
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
                        <button onClick={saveEdit} disabled={saving} className="btn-primary flex-1 justify-center py-2.5">
                          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
                          Salvar
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(plan)} className="w-full btn-outline justify-center py-2.5">
                        <Edit2 size={16} /> Editar Plano
                      </button>
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
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
