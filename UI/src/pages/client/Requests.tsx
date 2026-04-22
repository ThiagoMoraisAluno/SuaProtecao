import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, FileText } from "lucide-react";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { StatusBadge } from "@/components/features/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { fetchRequestsByClient } from "@/lib/api";
import { getRequestStatusConfig, getServiceTypeLabel, getCoverageTypeLabel, formatCurrency, formatDateTime } from "@/lib/utils";
import type { Request } from "@/types";

export function ClientRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchRequestsByClient(user.id).then(setRequests).finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">Meus Chamados</h1>
            <p className="text-slate-500 text-sm mt-1">{requests.length} chamado(s) no total</p>
          </div>
          <Link to="/client/new-request" className="btn-primary">
            <PlusCircle size={18} />
            Novo Chamado
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-16 text-center">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium mb-2">Nenhum chamado ainda</p>
            <p className="text-slate-400 text-sm mb-6">Solicite um serviço ou acione sua cobertura</p>
            <Link to="/client/new-request" className="btn-primary justify-center inline-flex">
              <PlusCircle size={18} />
              Abrir primeiro chamado
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
                          {isService ? getServiceTypeLabel((req as any).serviceType) : getCoverageTypeLabel((req as any).coverageType)}
                        </p>
                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">{req.description}</p>
                        {!isService && (req as any).estimatedLoss && (
                          <p className="text-sm font-semibold text-red-600 mt-1">Prejuízo: {formatCurrency((req as any).estimatedLoss)}</p>
                        )}
                        {!isService && (req as any).approvedAmount && (
                          <p className="text-sm font-semibold text-emerald-600 mt-1">✅ Aprovado: {formatCurrency((req as any).approvedAmount)}</p>
                        )}
                        {req.adminNotes && (
                          <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                            <p className="text-xs font-semibold text-amber-700 mb-0.5">Observação do Admin</p>
                            <p className="text-xs text-amber-700">{req.adminNotes}</p>
                          </div>
                        )}
                        {isService && (req as any).desiredDate && (
                          <p className="text-xs text-slate-400 mt-2">📅 Data desejada: {new Date((req as any).desiredDate).toLocaleDateString("pt-BR")}</p>
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
    </ClientLayout>
  );
}
