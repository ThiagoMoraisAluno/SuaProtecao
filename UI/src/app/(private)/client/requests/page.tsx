"use client";
import { PageSkeleton } from "@/components/ui/PageSkeleton";

import Link from "next/link";
import { PlusCircle, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/features/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { requestsService } from "@/services/requests.service";
import {
  getRequestStatusConfig, getServiceTypeLabel, getCoverageTypeLabel,
  formatCurrency, formatDateTime,
} from "@/lib/utils";

export default function ClientRequestsPage() {
  const { user } = useAuth();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["client-requests", user?.id],
    queryFn: () => requestsService.findAll(),
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <PageSkeleton />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Meus Chamados</h1>
          <p className="text-slate-500 text-sm mt-1">{requests.length} chamado(s) no total</p>
        </div>
        <Link href="/client/requests/new/service" className="btn-primary">
          <PlusCircle size={18} /> Novo Chamado
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-16 text-center">
          <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium mb-2">Nenhum chamado ainda</p>
          <p className="text-slate-400 text-sm mb-6">Solicite um serviço ou acione sua cobertura</p>
          <Link href="/client/requests/new/service" className="btn-primary justify-center inline-flex">
            <PlusCircle size={18} /> Abrir primeiro chamado
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const statusCfg = getRequestStatusConfig(req.status);
            const isService = req.type === "service";
            return (
              <div key={req.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isService ? "bg-blue-50" : "bg-purple-50"}`}>
                      <span className="text-xl">{isService ? "🔧" : "🛡️"}</span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${isService ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>
                          {isService ? "Serviço" : "Cobertura"}
                        </span>
                        <StatusBadge {...statusCfg} />
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        {req.type === "service" ? getServiceTypeLabel(req.serviceType) : getCoverageTypeLabel(req.coverageType)}
                      </p>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">{req.description}</p>
                      {req.type === "coverage" && req.estimatedLoss && (
                        <p className="text-sm font-semibold text-red-600 mt-1">Prejuízo: {formatCurrency(req.estimatedLoss)}</p>
                      )}
                      {req.type === "coverage" && req.approvedAmount && (
                        <p className="text-sm font-semibold text-emerald-600 mt-1">✅ Aprovado: {formatCurrency(req.approvedAmount)}</p>
                      )}
                      {req.adminNotes && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                          <p className="text-xs font-semibold text-amber-700 mb-0.5">Observação do Admin</p>
                          <p className="text-xs text-amber-700">{req.adminNotes}</p>
                        </div>
                      )}
                      {req.type === "service" && req.desiredDate && (
                        <p className="text-xs text-slate-400 mt-2">📅 Data desejada: {new Date(req.desiredDate).toLocaleDateString("pt-BR")}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 flex-shrink-0">{formatDateTime(req.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
