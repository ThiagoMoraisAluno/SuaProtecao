import { useState, useEffect, useMemo } from "react";
import { Search, UserPlus, Check } from "lucide-react";
import { SupervisorLayout } from "@/components/layout/SupervisorLayout";
import { StatusBadge } from "@/components/features/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { fetchClientsBySupervisor, fetchPlans, createClient } from "@/lib/api";
import { getClientStatusConfig, getPlanLabel, formatDate, formatCurrency } from "@/lib/utils";
import { APPLIANCES_LIST, BRAZILIAN_STATES } from "@/constants";
import { toast } from "sonner";
import type { Client, Plan, ClientAsset } from "@/types";

interface FormState {
  name: string; email: string; phone: string; cpf: string; password: string;
  street: string; number: string; complement: string;
  neighborhood: string; city: string; state: string; zipCode: string;
  planId: string;
  selectedAppliances: Record<string, boolean>;
  applianceValues: Record<string, string>;
}

const defaultForm: FormState = {
  name: "", email: "", phone: "", cpf: "", password: "123456",
  street: "", number: "", complement: "",
  neighborhood: "", city: "", state: "SP", zipCode: "",
  planId: "intermediate",
  selectedAppliances: {},
  applianceValues: {},
};

export function SupervisorClients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    if (!user) return;
    const [c, p] = await Promise.all([fetchClientsBySupervisor(user.id), fetchPlans()]);
    setClients(c);
    setPlans(p);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [user]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter((c) => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }, [clients, search]);

  const totalAssetsValue = useMemo(() => {
    return Object.entries(form.selectedAppliances)
      .filter(([, selected]) => selected)
      .reduce((sum, [name]) => sum + (Number(form.applianceValues[name]) || 0), 0);
  }, [form.selectedAppliances, form.applianceValues]);

  const selectedPlan = useMemo(() => plans.find((p) => p.id === form.planId), [form.planId, plans]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    const assets: ClientAsset[] = Object.entries(form.selectedAppliances)
      .filter(([, selected]) => selected)
      .map(([name]) => ({ name, estimatedValue: Number(form.applianceValues[name]) || 0 }));

    try {
      await createClient({
        name: form.name,
        email: form.email,
        phone: form.phone,
        cpf: form.cpf,
        password: form.password,
        planId: form.planId,
        supervisorId: user.id,
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
        totalAssetsValue,
      });
      await loadData();
      setShowForm(false);
      setForm(defaultForm);
      toast.success(`Cliente ${form.name} cadastrado com sucesso!`);
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar cliente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SupervisorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      </SupervisorLayout>
    );
  }

  return (
    <SupervisorLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">Meus Clientes</h1>
            <p className="text-slate-500 text-sm mt-1">{clients.length} clientes cadastrados por você</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <UserPlus size={18} />
            {showForm ? "Cancelar" : "Novo Cliente"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-brand-200 shadow-sm animate-fade-in">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Cadastrar Novo Cliente</h2>
              <p className="text-sm text-slate-500 mt-1">Preencha todos os dados para concluir o cadastro</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Personal Data */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 text-xs font-bold">1</span>
                  Dados Pessoais
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Nome Completo *</label>
                    <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" placeholder="Nome completo" />
                  </div>
                  <div>
                    <label className="form-label">CPF *</label>
                    <input type="text" required value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} className="form-input" placeholder="000.000.000-00" />
                  </div>
                  <div>
                    <label className="form-label">E-mail *</label>
                    <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="form-input" placeholder="email@exemplo.com" />
                  </div>
                  <div>
                    <label className="form-label">Telefone</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="form-input" placeholder="(00) 00000-0000" />
                  </div>
                  <div>
                    <label className="form-label">Senha inicial *</label>
                    <input type="text" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="form-input" placeholder="Senha padrão" />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 text-xs font-bold">2</span>
                  Endereço Residencial
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">CEP *</label>
                    <input type="text" required value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} className="form-input" placeholder="00000-000" />
                  </div>
                  <div>
                    <label className="form-label">Estado *</label>
                    <select required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="form-select">
                      {BRAZILIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="form-label">Rua / Logradouro *</label>
                    <input type="text" required value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="form-input" placeholder="Nome da rua" />
                  </div>
                  <div>
                    <label className="form-label">Número *</label>
                    <input type="text" required value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="form-input" placeholder="123" />
                  </div>
                  <div>
                    <label className="form-label">Complemento</label>
                    <input type="text" value={form.complement} onChange={(e) => setForm({ ...form, complement: e.target.value })} className="form-input" placeholder="Apto, sala, etc." />
                  </div>
                  <div>
                    <label className="form-label">Bairro *</label>
                    <input type="text" required value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className="form-input" placeholder="Bairro" />
                  </div>
                  <div>
                    <label className="form-label">Cidade *</label>
                    <input type="text" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="form-input" placeholder="Cidade" />
                  </div>
                </div>
              </div>

              {/* Plan */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 text-xs font-bold">3</span>
                  Plano Escolhido
                </h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setForm({ ...form, planId: plan.id })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        form.planId === plan.id ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-900">{plan.name}</p>
                      <p className="text-lg font-bold text-brand-600 mt-1">{formatCurrency(plan.price)}/mês</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {plan.servicesPerMonth === -1 ? "Ilimitado" : `${plan.servicesPerMonth} serv./mês`} · Cobertura {formatCurrency(plan.coverageLimit)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Assets */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 text-xs font-bold">4</span>
                  Bens do Imóvel (Checklist)
                </h3>
                <p className="text-xs text-slate-500 mb-4">Selecione os bens e informe o valor estimado</p>
                <div className="grid sm:grid-cols-2 gap-2 mb-4">
                  {APPLIANCES_LIST.map((appliance) => (
                    <label key={appliance} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      form.selectedAppliances[appliance] ? "border-brand-300 bg-brand-50" : "border-slate-100 hover:border-slate-200"
                    }`}>
                      <input
                        type="checkbox"
                        checked={!!form.selectedAppliances[appliance]}
                        onChange={(e) => setForm({ ...form, selectedAppliances: { ...form.selectedAppliances, [appliance]: e.target.checked } })}
                        className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-slate-700 flex-1">{appliance}</span>
                      {form.selectedAppliances[appliance] && (
                        <input
                          type="number"
                          min="0"
                          placeholder="R$"
                          value={form.applianceValues[appliance] || ""}
                          onChange={(e) => setForm({ ...form, applianceValues: { ...form.applianceValues, [appliance]: e.target.value } })}
                          className="w-24 text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-right focus:outline-none focus:ring-2 focus:ring-brand-500"
                          onClick={(e) => e.preventDefault()}
                        />
                      )}
                    </label>
                  ))}
                </div>

                {selectedPlan && (
                  <div className={`p-4 rounded-xl border ${
                    totalAssetsValue > selectedPlan.coverageLimit ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"
                  }`}>
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
                          <p className="text-xs text-red-600 mt-0.5">⚠️ Acima do limite</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-brand-700">{user?.name?.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Supervisor responsável</p>
                  <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
                  {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
                  Cadastrar Cliente
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Buscar clientes..." value={search} onChange={(e) => setSearch(e.target.value)} className="form-input pl-10 max-w-sm" />
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Cliente</th>
                  <th className="table-header">Plano</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Bens</th>
                  <th className="table-header">Cidade</th>
                  <th className="table-header">Desde</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">Nenhum cliente encontrado</td>
                  </tr>
                ) : (
                  filtered.map((client) => {
                    const statusCfg = getClientStatusConfig(client.status);
                    return (
                      <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-brand-700">{client.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{client.name}</p>
                              <p className="text-xs text-slate-400">{client.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell text-sm font-medium text-slate-700">{getPlanLabel(client.planId)}</td>
                        <td className="table-cell"><StatusBadge {...statusCfg} /></td>
                        <td className="table-cell text-sm text-slate-600">{formatCurrency(client.totalAssetsValue)}</td>
                        <td className="table-cell text-sm text-slate-500">{client.address.city} - {client.address.state}</td>
                        <td className="table-cell text-xs text-slate-400">{formatDate(client.joinedAt)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SupervisorLayout>
  );
}
