"use client";

import { useMemo, useState } from "react";
import { CreditCard, FileText, QrCode, X, ExternalLink } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentsService } from "@/services/payments.service";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { toast } from "sonner";
import type { Payment, PaymentMethod, PaymentStatus } from "@/types";

const STATUS_META: Record<PaymentStatus, { label: string; cn: string }> = {
  pending: { label: "Pendente", cn: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { label: "Confirmado", cn: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  overdue: { label: "Em atraso", cn: "bg-red-50 text-red-700 border-red-200" },
  refunded: { label: "Reembolsado", cn: "bg-violet-50 text-violet-700 border-violet-200" },
  cancelled: { label: "Cancelado", cn: "bg-slate-50 text-slate-600 border-slate-200" },
};

const METHOD_META: Record<PaymentMethod, { label: string; icon: typeof QrCode }> = {
  pix: { label: "PIX", icon: QrCode },
  boleto: { label: "Boleto", icon: FileText },
  credit_card: { label: "Cartão", icon: CreditCard },
};

const PAGE_SIZE = 50;

export default function AdminPaymentsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "all">("all");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-payments", statusFilter, methodFilter, page],
    queryFn: () =>
      paymentsService.list({
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(methodFilter !== "all" && { method: methodFilter }),
      }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => paymentsService.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
      toast.success("Pagamento cancelado.");
    },
    onError: () => toast.error("Erro ao cancelar pagamento."),
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const totals = useMemo(() => {
    let confirmed = 0;
    let pendingAmount = 0;
    let overdue = 0;
    for (const p of items) {
      if (p.status === "confirmed") confirmed += p.amount;
      else if (p.status === "pending") pendingAmount += p.amount;
      else if (p.status === "overdue") overdue += p.amount;
    }
    return { confirmed, pendingAmount, overdue };
  }, [items]);

  const handleCancel = (payment: Payment) => {
    const ok = window.confirm(
      `Cancelar a cobrança de ${formatCurrency(payment.amount)} para ${payment.clientName ?? "cliente"}?`,
    );
    if (!ok) return;
    cancelMutation.mutate(payment.id);
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Pagamentos</h1>
        <p className="text-slate-500 text-sm mt-1">
          {total} cobrança{total === 1 ? "" : "s"} no sistema
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-emerald-700 uppercase">
            Confirmado (página)
          </p>
          <p className="text-2xl font-bold text-emerald-900 font-display mt-1">
            {formatCurrency(totals.confirmed)}
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-amber-700 uppercase">
            Pendente
          </p>
          <p className="text-2xl font-bold text-amber-900 font-display mt-1">
            {formatCurrency(totals.pendingAmount)}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-red-700 uppercase">
            Em atraso
          </p>
          <p className="text-2xl font-bold text-red-900 font-display mt-1">
            {formatCurrency(totals.overdue)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as PaymentStatus | "all");
            setPage(0);
          }}
          className="form-input max-w-[180px]"
        >
          <option value="all">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="confirmed">Confirmado</option>
          <option value="overdue">Em atraso</option>
          <option value="refunded">Reembolsado</option>
          <option value="cancelled">Cancelado</option>
        </select>

        <select
          value={methodFilter}
          onChange={(e) => {
            setMethodFilter(e.target.value as PaymentMethod | "all");
            setPage(0);
          }}
          className="form-input max-w-[180px]"
        >
          <option value="all">Todos os métodos</option>
          <option value="pix">PIX</option>
          <option value="boleto">Boleto</option>
          <option value="credit_card">Cartão</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            Nenhum pagamento corresponde aos filtros.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Cliente</th>
                <th className="table-header">Plano</th>
                <th className="table-header">Valor</th>
                <th className="table-header">Método</th>
                <th className="table-header">Vencimento</th>
                <th className="table-header">Status</th>
                <th className="table-header text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((payment) => {
                const status = STATUS_META[payment.status];
                const methodMeta = METHOD_META[payment.method];
                const MethodIcon = methodMeta.icon;
                const cancellable =
                  payment.status === "pending" || payment.status === "overdue";
                return (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="table-cell font-medium text-slate-900">
                      {payment.clientName ?? "—"}
                    </td>
                    <td className="table-cell text-slate-600">
                      {payment.planName ?? "—"}
                    </td>
                    <td className="table-cell">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                        <MethodIcon size={14} />
                        {methodMeta.label}
                      </span>
                    </td>
                    <td className="table-cell text-slate-500 text-sm">
                      {formatDate(payment.dueDate)}
                    </td>
                    <td className="table-cell">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${status.cn}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-end gap-2">
                        {payment.invoiceUrl && (
                          <a
                            href={payment.invoiceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                            aria-label="Ver no Asaas"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        {cancellable && (
                          <button
                            onClick={() => handleCancel(payment)}
                            disabled={cancelMutation.isPending}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                            aria-label="Cancelar"
                            title="Cancelar"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="btn-secondary py-1.5 text-sm disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-slate-500">
            Página {page + 1} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="btn-secondary py-1.5 text-sm disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
