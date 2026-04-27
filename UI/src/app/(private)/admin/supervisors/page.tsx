"use client";
import { PageSkeleton } from "@/components/ui/PageSkeleton";

import { useState, useMemo } from "react";
import { Search, UserPlus, X, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supervisorsService } from "@/services/supervisors.service";
import { clientsService } from "@/services/clients.service";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";

export default function AdminSupervisorsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", commission: "10", password: "" });

  const { data: supervisors = [], isLoading } = useQuery({
    queryKey: ["supervisors"],
    queryFn: () => supervisorsService.findAll(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsService.findAll(),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      supervisorsService.create({
        name: form.name,
        email: form.email,
        phone: form.phone,
        commission: Number(form.commission),
        password: form.password,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["supervisors"] });
      setShowForm(false);
      setForm({ name: "", email: "", phone: "", commission: "10", password: "" });
      toast.success(`Supervisor ${form.name} cadastrado!`);
    },
    onError: (err: unknown) => {
      toast.error(
        axios.isAxiosError<{ message: string }>(err)
          ? (err.response?.data?.message ?? "Erro ao cadastrar supervisor.")
          : "Erro ao cadastrar supervisor."
      );
    },
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return supervisors.filter((s) => !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
  }, [supervisors, search]);

  const enriched = useMemo(() => {
    return filtered.map((s) => {
      const sc = clients.filter((c) => c.supervisorId === s.id);
      return {
        ...s,
        totalClients: sc.length,
        activeClients: sc.filter((c) => c.status === "active").length,
        defaulterClients: sc.filter((c) => c.status === "defaulter").length,
      };
    });
  }, [filtered, clients]);

  if (isLoading) {
    return (
      <PageSkeleton />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Supervisores</h1>
          <p className="text-slate-500 text-sm mt-1">{supervisors.length} supervisores cadastrados</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <UserPlus size={18} /> Novo Supervisor
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-brand-200 shadow-sm p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-slate-900">Cadastrar Novo Supervisor</h2>
            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg">
              <X size={18} className="text-slate-500" />
            </button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Nome Completo *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" placeholder="Nome do supervisor" />
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
              <label className="form-label">Comissão (%)</label>
              <input type="number" min="0" max="100" step="0.5" value={form.commission} onChange={(e) => setForm({ ...form, commission: e.target.value })} className="form-input" />
            </div>
            <div>
              <label className="form-label">Senha inicial</label>
              <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="form-input" placeholder="Senha padrão" />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" disabled={createMutation.isPending} className="btn-primary">
                {createMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
                Cadastrar Supervisor
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar supervisores..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input pl-10 max-w-sm"
        />
      </div>

      {enriched.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-16 text-center">
          <p className="text-slate-400">Nenhum supervisor encontrado</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enriched.map((sup) => (
            <div key={sup.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{sup.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{sup.name}</p>
                    <p className="text-xs text-slate-400">{sup.email}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full">
                  {sup.commission}% comissão
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-50">
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-900 font-display">{sup.totalClients}</p>
                  <p className="text-xs text-slate-400">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-emerald-600 font-display">{sup.activeClients}</p>
                  <p className="text-xs text-slate-400">Ativos</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-red-500 font-display">{sup.defaulterClients}</p>
                  <p className="text-xs text-slate-400">Inadimp.</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-50">
                <p className="text-xs text-slate-400">📱 {sup.phone || "Não informado"} · Desde {formatDate(sup.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
