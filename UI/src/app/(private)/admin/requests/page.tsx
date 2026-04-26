"use client";

import { useState, useMemo } from "react";
import { Search, X, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StatusBadge } from "@/components/features/StatusBadge";
import { requestsService, type UpdateRequestDto } from "@/services/requests.service";
import {
  getRequestStatusConfig, getServiceTypeLabel, getCoverageTypeLabel,
  formatCurrency, formatDateTime,
} from "@/lib/utils";
import { toast } from "sonner";
import type { RequestStatus, Request } from "@/types";

const SERVICE_STATUSES: RequestStatus[] = ["pending", "in_progress", "completed"];
const COVERAGE_STATUSES: RequestStatus[] = ["analyzing", "approved", "denied"];

export default function AdminRequestsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "service" | "coverage">("all");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState<RequestStatus>("pending");
  const [approvedAmount, setApprovedAmount] = useState("");

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["requests"],
    queryFn: () => requestsService.findAll(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRequestDto }) =>
      requestsService.updateStatus(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      setSelectedRequest(null);
      toast.success("Chamado atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar chamado."),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return requests.filter((r) => {
      const matchSearch = !q || r.clientName.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
      const matchType = typeFilter === "all" || r.type === typeFilter;
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [requests, search, typeFilter, statusFilter]);

  const openDetail = (req: Request) => {
    setSelectedRequest(req);
    setAdminNotes(req.adminNotes || "");
    setNewStatus(req.status);
    setApprovedAmount(req.type === "coverage" && req.approvedAmount ? String(req.approvedAmount) : "");
  };

  const handleUpdate = () => {
    if (!selectedRequest) return;
    const dto: UpdateRequestDto = { status: newStatus, adminNotes };
    if (selectedRequest.type === "coverage" && approvedAmount) {
      dto.approvedAmount = Number(approvedAmount);
    }
    updateMutation.mutate({ id: selectedRequest.id, dto });
  };

  const getStatuses = (req: Request) => req.type === "service" ? SERVICE_STATUSES : COVERAGE_STATUSES;
  const getStatusLabel = (s: RequestStatus) => getRequestStatusConfig(s).label;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Chamados</h1>
        <p className="text-slate-500 text-sm mt-1">{requests.length} chamados no sistema</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { label: "Todos", value: "all", count: requests.length },
          { label: "Serviços", value: "service", count: requests.filter((r) => r.type === "service").length },
          { label: "Coberturas", value: "coverage", count: requests.filter((r) => r.type === "coverage").length },
        ].map((tab) => (
          <button key={tab.value}
            onClick={() => setTypeFilter(tab.value as "all" | "service" | "coverage")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              typeFilter === tab.value ? "bg-brand-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}>
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${typeFilter === tab.value ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Buscar chamados..." value={search} onChange={(e) => setSearch(e.target.value)} className="form-input pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as RequestStatus | "all")} className="form-select sm:w-48">
          <option value="all">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="in_progress">Em Atendimento</option>
          <option value="completed">Concluído</option>
          <option value="analyzing">Em Análise</option>
          <option value="approved">Aprovado</option>
          <option value="denied">Negado</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 p-16 text-center">
            <p className="text-slate-400">Nenhum chamado encontrado</p>
          </div>
        ) : (
          filtered.map((req) => {
            const statusCfg = getRequestStatusConfig(req.status);
            return (
              <div key={req.id}
                className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openDetail(req)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${req.type === "service" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>
                        {req.type === "service" ? "🔧 Serviço" : "🛡️ Cobertura"}
                      </span>
                      <StatusBadge {...statusCfg} />
                      <span className="text-xs text-slate-400">#{req.id.slice(-8)}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-900">{req.clientName}</p>
                      <span className="text-slate-300">·</span>
                      <p className="text-sm text-slate-500">
                        {req.type === "service" ? getServiceTypeLabel(req.serviceType) : getCoverageTypeLabel(req.coverageType)}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500 truncate">{req.description}</p>
                    {req.type === "coverage" && (
                      <p className="text-sm font-semibold text-red-600 mt-1">Prejuízo estimado: {formatCurrency(req.estimatedLoss)}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-slate-400">{new Date(req.createdAt).toLocaleDateString("pt-BR")}</p>
                    <button className="mt-2 text-brand-600 hover:text-brand-700 text-xs font-medium">Ver detalhes →</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelectedRequest(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Detalhes do Chamado</h2>
                <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X size={18} className="text-slate-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Cliente</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedRequest.clientName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Tipo</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedRequest.type === "service" ? getServiceTypeLabel(selectedRequest.serviceType) : getCoverageTypeLabel(selectedRequest.coverageType)}
                  </p>
                </div>
                {selectedRequest.type === "service" && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Data Desejada</p>
                    <p className="text-sm text-slate-700">{new Date(selectedRequest.desiredDate).toLocaleDateString("pt-BR")}</p>
                  </div>
                )}
                {selectedRequest.type === "coverage" && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Valor do Prejuízo</p>
                    <p className="text-sm font-semibold text-red-600">{formatCurrency(selectedRequest.estimatedLoss)}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Data do Chamado</p>
                  <p className="text-sm text-slate-700">{formatDateTime(selectedRequest.createdAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Descrição</p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-4 leading-relaxed">{selectedRequest.description}</p>
              </div>

              <div>
                <label className="form-label">Novo Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as RequestStatus)} className="form-select">
                  {getStatuses(selectedRequest).map((s) => (
                    <option key={s} value={s}>{getStatusLabel(s)}</option>
                  ))}
                </select>
              </div>

              {selectedRequest.type === "coverage" && newStatus === "approved" && (
                <div>
                  <label className="form-label">Valor Aprovado (R$)</label>
                  <input type="number" min="0" step="0.01" value={approvedAmount} onChange={(e) => setApprovedAmount(e.target.value)} className="form-input" placeholder="0,00" />
                </div>
              )}

              <div>
                <label className="form-label">Observações do Admin</label>
                <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} className="form-input resize-none" placeholder="Adicione observações..." />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setSelectedRequest(null)} className="btn-secondary flex-1 justify-center">Cancelar</button>
                <button onClick={handleUpdate} disabled={updateMutation.isPending} className="btn-primary flex-1 justify-center">
                  {updateMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
