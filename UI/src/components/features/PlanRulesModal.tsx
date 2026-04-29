"use client";

import { useState } from "react";
import { X, Save, Trash2, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { servicesService } from "@/services/services.service";
import { planRulesService } from "@/services/plan-rules.service";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";
import type { Plan, Service, PlanServiceRule } from "@/types";

interface Props {
  plan: Plan;
  onClose: () => void;
}

type RuleForm = {
  serviceId: string;
  maxPerMonth: string;
  maxPerYear: string;
  coverageLimit: string;
};

const EMPTY_RULE: RuleForm = {
  serviceId: "",
  maxPerMonth: "1",
  maxPerYear: "12",
  coverageLimit: "0",
};

export function PlanRulesModal({ plan, onClose }: Props) {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<RuleForm>(EMPTY_RULE);

  const { data: rules = [], isLoading: loadingRules } = useQuery({
    queryKey: ["plan-rules", plan.id],
    queryFn: () => planRulesService.findByPlan(plan.id),
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services", "active"],
    queryFn: () => servicesService.findAll(false),
  });

  const upsertMutation = useMutation({
    mutationFn: () => {
      if (!form.serviceId) throw new Error("Selecione um serviço.");
      return planRulesService.upsert(plan.id, form.serviceId, {
        maxPerMonth: Number(form.maxPerMonth),
        maxPerYear: Number(form.maxPerYear),
        coverageLimit: Number(form.coverageLimit),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plan-rules", plan.id] });
      setEditingId(null);
      setShowAdd(false);
      setForm(EMPTY_RULE);
      toast.success("Regra salva!");
    },
    onError: (err: unknown) => {
      toast.error(
        axios.isAxiosError<{ message: string }>(err)
          ? (err.response?.data?.message ?? "Erro ao salvar regra.")
          : (err instanceof Error ? err.message : "Erro ao salvar regra."),
      );
    },
  });

  const removeMutation = useMutation({
    mutationFn: (serviceId: string) =>
      planRulesService.remove(plan.id, serviceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plan-rules", plan.id] });
      toast.success("Regra removida.");
    },
    onError: () => toast.error("Erro ao remover regra."),
  });

  const startEdit = (rule: PlanServiceRule) => {
    setEditingId(rule.id);
    setShowAdd(false);
    setForm({
      serviceId: rule.serviceId,
      maxPerMonth: String(rule.maxPerMonth),
      maxPerYear: String(rule.maxPerYear),
      coverageLimit: String(rule.coverageLimit),
    });
  };

  const startAdd = () => {
    setEditingId(null);
    setForm(EMPTY_RULE);
    setShowAdd(true);
  };

  const cancel = () => {
    setEditingId(null);
    setShowAdd(false);
    setForm(EMPTY_RULE);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertMutation.mutate();
  };

  const availableServices: Service[] = showAdd
    ? services.filter((s) => !rules.some((r) => r.serviceId === s.id))
    : services;

  const renderForm = (mode: "add" | "edit") => (
    <form onSubmit={submit} className="bg-brand-50 border border-brand-200 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {mode === "add" ? (
          <div className="col-span-2">
            <label className="form-label">Serviço</label>
            <select
              value={form.serviceId}
              onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
              className="form-input"
              required
            >
              <option value="">Selecione…</option>
              {availableServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon ? `${s.icon} ` : ""}{s.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div>
          <label className="form-label">Por mês (-1 = ∞)</label>
          <input
            type="number"
            min="-1"
            value={form.maxPerMonth}
            onChange={(e) => setForm({ ...form, maxPerMonth: e.target.value })}
            className="form-input"
            required
          />
        </div>

        <div>
          <label className="form-label">Por ano (-1 = ∞)</label>
          <input
            type="number"
            min="-1"
            value={form.maxPerYear}
            onChange={(e) => setForm({ ...form, maxPerYear: e.target.value })}
            className="form-input"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="form-label">Cobertura por chamado (R$)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.coverageLimit}
            onChange={(e) => setForm({ ...form, coverageLimit: e.target.value })}
            className="form-input"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={cancel} className="btn-secondary py-2">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={upsertMutation.isPending}
          className="btn-primary py-2"
        >
          <Save size={16} /> {upsertMutation.isPending ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </form>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">Serviços Cobertos</h2>
            <p className="text-sm text-slate-500">Plano: {plan.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {loadingRules ? (
            <div className="py-8 text-center text-slate-400">Carregando…</div>
          ) : (
            <>
              {rules.length === 0 ? (
                <div className="bg-slate-50 rounded-xl p-8 text-center">
                  <p className="text-slate-500 text-sm">
                    Nenhum serviço configurado neste plano. Adicione abaixo.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {rules.map((rule) => (
                    <div key={rule.id}>
                      {editingId === rule.id ? (
                        renderForm("edit")
                      ) : (
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50">
                          <span className="text-2xl">{rule.serviceIcon ?? "🛠️"}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                              {rule.serviceName}
                              {!rule.serviceIsActive && (
                                <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  inativo
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500">
                              {rule.maxPerMonth === -1 ? "∞" : rule.maxPerMonth}/mês ·{" "}
                              {rule.maxPerYear === -1 ? "∞" : rule.maxPerYear}/ano · até{" "}
                              {formatCurrency(rule.coverageLimit)}
                            </p>
                          </div>
                          <button
                            onClick={() => startEdit(rule)}
                            className="text-xs text-brand-600 hover:text-brand-700 font-medium px-2 py-1"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => removeMutation.mutate(rule.serviceId)}
                            disabled={removeMutation.isPending}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                            aria-label="Remover regra"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {showAdd ? (
                renderForm("add")
              ) : (
                <button
                  onClick={startAdd}
                  className="w-full btn-outline justify-center py-2.5"
                  disabled={availableServices.length === 0 && rules.length > 0}
                >
                  <Plus size={16} /> Adicionar Serviço
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
