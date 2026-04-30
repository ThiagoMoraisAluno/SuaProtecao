"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  FileText,
  QrCode,
  ExternalLink,
  Eye,
  X,
  Copy,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { paymentsService } from "@/services/payments.service";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { toast } from "sonner";
import type { Payment, PaymentMethod, PaymentStatus } from "@/types";

const STATUS_META: Record<PaymentStatus, { label: string; cn: string }> = {
  pending: {
    label: "Pendente",
    cn: "bg-amber-50 text-amber-700 border-amber-200",
  },
  confirmed: {
    label: "Confirmado",
    cn: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  overdue: {
    label: "Em atraso",
    cn: "bg-red-50 text-red-700 border-red-200",
  },
  refunded: {
    label: "Reembolsado",
    cn: "bg-violet-50 text-violet-700 border-violet-200",
  },
  cancelled: {
    label: "Cancelado",
    cn: "bg-slate-50 text-slate-600 border-slate-200",
  },
};

const METHOD_META: Record<PaymentMethod, { label: string; icon: typeof QrCode }> = {
  pix: { label: "PIX", icon: QrCode },
  boleto: { label: "Boleto", icon: FileText },
  credit_card: { label: "Cartão", icon: CreditCard },
};

const PAGE_SIZE = 20;

export default function ClientPaymentsPage() {
  const [page, setPage] = useState(0);
  const [pixOpen, setPixOpen] = useState<Payment | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["client-payments", page],
    queryFn: () =>
      paymentsService.list({ limit: PAGE_SIZE, offset: page * PAGE_SIZE }),
  });

  if (isLoading) return <PageSkeleton />;

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Meus Pagamentos
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {total} cobrança{total === 1 ? "" : "s"} no histórico
          </p>
        </div>
        <Link href="/client/checkout" className="btn-primary">
          Gerar nova cobrança
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
          <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Nenhum pagamento registrado.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
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
                return (
                  <tr
                    key={payment.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="table-cell font-medium text-slate-900">
                      {payment.planName ?? "—"}
                    </td>
                    <td className="table-cell">
                      {formatCurrency(payment.amount)}
                      {payment.totalInstallments && (
                        <span className="text-xs text-slate-400 ml-1">
                          ({payment.totalInstallments}x)
                        </span>
                      )}
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
                        {payment.method === "pix" && payment.pixCode && (
                          <button
                            onClick={() => setPixOpen(payment)}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                            aria-label="Ver PIX"
                            title="Ver PIX"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        {payment.boletoUrl && (
                          <a
                            href={payment.boletoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                            aria-label="Ver boleto"
                            title="Ver boleto"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        {payment.method === "credit_card" && payment.invoiceUrl && (
                          <a
                            href={payment.invoiceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                            aria-label="Ver fatura"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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

      {pixOpen && (
        <PixModal payment={pixOpen} onClose={() => setPixOpen(null)} />
      )}
    </div>
  );
}

function PixModal({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 font-display">
            Pagamento PIX
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {payment.pixQrCode && (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${payment.pixQrCode}`}
                alt="QR Code PIX"
                className="w-56 h-56 border border-slate-200 rounded-xl"
              />
            </div>
          )}

          {payment.pixCode && (
            <div>
              <label className="form-label">Copia e cola</label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={payment.pixCode}
                  className="form-input font-mono text-xs"
                />
                <button
                  onClick={() => {
                    void navigator.clipboard.writeText(payment.pixCode!);
                    toast.success("Código PIX copiado!");
                  }}
                  className="btn-secondary"
                  aria-label="Copiar"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          )}

          {payment.status === "pending" && (
            <div className="flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <Loader2 className="w-4 h-4 animate-spin" />
              Aguardando pagamento…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
