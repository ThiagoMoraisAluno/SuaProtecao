"use client";
import { PageSkeleton } from "@/components/ui/PageSkeleton";

import { useState } from "react";
import { Plus, Pencil, Power, X, Save, Wrench } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { servicesService } from "@/services/services.service";
import { toast } from "sonner";
import axios from "axios";
import type { Service } from "@/types";

type ServiceForm = {
  name: string;
  slug: string;
  icon: string;
  isActive: boolean;
};

const EMPTY_FORM: ServiceForm = {
  name: "",
  slug: "",
  icon: "",
  isActive: true,
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function AdminServicesPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Service | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services", "all"],
    queryFn: () => servicesService.findAll(true),
  });

  const upsertMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        return servicesService.update(editing.id, {
          name: form.name,
          slug: form.slug,
          icon: form.icon || undefined,
          isActive: form.isActive,
        });
      }
      return servicesService.create({
        name: form.name,
        slug: form.slug,
        icon: form.icon || undefined,
        isActive: form.isActive,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
      qc.invalidateQueries({ queryKey: ["plan-rules"] });
      closeForm();
      toast.success(editing ? "Serviço atualizado!" : "Serviço criado!");
    },
    onError: (err: unknown) => {
      toast.error(
        axios.isAxiosError<{ message: string }>(err)
          ? (err.response?.data?.message ?? "Erro ao salvar serviço.")
          : "Erro ao salvar serviço.",
      );
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => servicesService.toggle(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
      toast.success("Status alterado.");
    },
    onError: () => toast.error("Erro ao alterar status."),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (service: Service) => {
    setEditing(service);
    setForm({
      name: service.name,
      slug: service.slug,
      icon: service.icon ?? "",
      isActive: service.isActive,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Preencha nome e slug.");
      return;
    }
    upsertMutation.mutate();
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Catálogo de Serviços</h1>
          <p className="text-slate-500 text-sm mt-1">
            Gerencie os tipos de serviço oferecidos. Após criar, configure os limites por plano em &quot;Planos&quot;.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={18} /> Novo Serviço
        </button>
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
          <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Nenhum serviço cadastrado ainda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Serviço</th>
                <th className="table-header">Slug</th>
                <th className="table-header">Status</th>
                <th className="table-header text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{service.icon ?? "🛠️"}</span>
                      <span className="font-medium text-slate-900">{service.name}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">{service.slug}</code>
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      service.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-50 text-slate-600 border border-slate-200"
                    }`}>
                      {service.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(service)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                        aria-label="Editar serviço"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => toggleMutation.mutate(service.id)}
                        disabled={toggleMutation.isPending}
                        className={`p-2 rounded-lg ${
                          service.isActive
                            ? "text-amber-600 hover:bg-amber-50"
                            : "text-emerald-600 hover:bg-emerald-50"
                        }`}
                        aria-label={service.isActive ? "Desativar" : "Ativar"}
                        title={service.isActive ? "Desativar" : "Ativar"}
                      >
                        <Power size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 font-display">
                {editing ? "Editar Serviço" : "Novo Serviço"}
              </h2>
              <button onClick={closeForm} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submit} className="p-6 space-y-4">
              <div>
                <label className="form-label">Nome *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      name,
                      slug: editing ? prev.slug : slugify(name),
                    }));
                  }}
                  className="form-input"
                  minLength={2}
                  placeholder="Ar-condicionado"
                  required
                />
              </div>

              <div>
                <label className="form-label">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="form-input font-mono"
                  pattern="[a-z0-9_-]+"
                  placeholder="ar-condicionado"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">
                  Apenas letras minúsculas, números, hífen e underline.
                </p>
              </div>

              <div>
                <label className="form-label">Ícone (emoji ou texto curto)</label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="form-input"
                  placeholder="❄️"
                  maxLength={8}
                />
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                Ativo (disponível para vincular em planos)
              </label>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button type="button" onClick={closeForm} className="btn-secondary">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={upsertMutation.isPending}
                  className="btn-primary"
                >
                  <Save size={16} />
                  {upsertMutation.isPending ? "Salvando…" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
