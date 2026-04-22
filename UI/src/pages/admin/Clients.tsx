import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatusBadge } from "@/components/features/StatusBadge";
import { fetchClients, fetchSupervisors, fetchPlans, updateClientStatus } from "@/lib/api";
import { getClientStatusConfig, getPlanLabel, formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Client, Supervisor, Plan, ClientStatus } from "@/types";

export function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [supervisorFilter, setSupervisorFilter] = useState("all");

  const loadData = async () => {
    const [c, s, p] = await Promise.all([fetchClients(), fetchSupervisors(), fetchPlans()]);
    setClients(c);
    setSupervisors(s);
    setPlans(p);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.cpf.includes(q);
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      const matchPlan = planFilter === "all" || c.planId === planFilter;
      const matchSup = supervisorFilter === "all" || c.supervisorId === supervisorFilter;
      return matchSearch && matchStatus && matchPlan && matchSup;
    });
  }, [clients, search, statusFilter, planFilter, supervisorFilter]);

  const handleStatusChange = async (clientId: string, status: ClientStatus) => {
    await updateClientStatus(clientId, status);
    setClients((prev) => prev.map((c) => c.id === clientId ? { ...c, status } : c));
    toast.success("Status atualizado!");
  };

  const getSupervisorName = (id: string) => supervisors.find((s) => s.id === id)?.name || "-";
  const getPlanPrice = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    return plan ? formatCurrency(plan.price) : "-";
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
          <h1 className="text-2xl font-bold text-slate-900 font-display">Clientes</h1>
          <p className="text-slate-500 text-sm mt-1">{clients.length} clientes cadastrados</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail ou CPF..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input pl-10"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ClientStatus | "all")} className="form-select sm:w-44">
              <option value="all">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="defaulter">Inadimplente</option>
              <option value="inactive">Inativo</option>
            </select>
            <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="form-select sm:w-44">
              <option value="all">Todos os planos</option>
              {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={supervisorFilter} onChange={(e) => setSupervisorFilter(e.target.value)} className="form-select sm:w-44">
              <option value="all">Todos os supervisores</option>
              {supervisors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Cliente</th>
                  <th className="table-header">CPF</th>
                  <th className="table-header">Plano</th>
                  <th className="table-header">Valor</th>
                  <th className="table-header">Supervisor</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Desde</th>
                  <th className="table-header">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-slate-400">Nenhum cliente encontrado</td>
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
                        <td className="table-cell font-mono text-xs">{client.cpf}</td>
                        <td className="table-cell text-sm font-medium text-slate-700">{getPlanLabel(client.planId)}</td>
                        <td className="table-cell font-semibold text-brand-600">{getPlanPrice(client.planId)}</td>
                        <td className="table-cell text-slate-600">{getSupervisorName(client.supervisorId)}</td>
                        <td className="table-cell"><StatusBadge {...statusCfg} /></td>
                        <td className="table-cell text-slate-400 text-xs">{formatDate(client.joinedAt)}</td>
                        <td className="table-cell">
                          <select
                            value={client.status}
                            onChange={(e) => handleStatusChange(client.id, e.target.value as ClientStatus)}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                          >
                            <option value="active">Ativo</option>
                            <option value="defaulter">Inadimplente</option>
                            <option value="inactive">Inativo</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/50">
              <p className="text-xs text-slate-500">{filtered.length} de {clients.length} clientes</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
