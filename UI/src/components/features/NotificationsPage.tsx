"use client";

import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "@/services/notifications.service";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { toast } from "sonner";
import type { NotificationType } from "@/types";

const PAGE_SIZE = 20;

const TYPE_META: Record<NotificationType, { icon: string; tone: string; label: string }> = {
  request_opened: { icon: "📨", tone: "text-blue-600", label: "Chamado aberto" },
  request_updated: { icon: "🔄", tone: "text-violet-600", label: "Chamado atualizado" },
  request_closed: { icon: "✅", tone: "text-emerald-600", label: "Chamado encerrado" },
  payment_overdue: { icon: "⚠️", tone: "text-red-600", label: "Pagamento em atraso" },
};

export function NotificationsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "page", page, unreadOnly],
    queryFn: () =>
      notificationsService.list({
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        unreadOnly,
      }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(`${result.updated} notificação(ões) marcada(s) como lida(s).`);
    },
  });

  if (isLoading) return <PageSkeleton />;

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const unread = data?.unreadCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-600" /> Notificações
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {total} no total · {unread} não lida{unread === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setUnreadOnly(false); setPage(0); }}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              !unreadOnly ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-600"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => { setUnreadOnly(true); setPage(0); }}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              unreadOnly ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-600"
            }`}
          >
            Não lidas
          </button>
          {unread > 0 && (
            <button
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
              className="btn-secondary py-1.5 text-sm"
            >
              <CheckCheck size={16} /> Marcar todas
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Bell className="w-10 h-10 mx-auto mb-4 text-slate-300" />
            <p>Nenhuma notificação.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {items.map((n) => {
              const meta = TYPE_META[n.type] ?? { icon: "🔔", tone: "text-slate-600", label: "Notificação" };
              return (
                <li key={n.id}>
                  <button
                    onClick={() => {
                      if (!n.isRead) markReadMutation.mutate(n.id);
                    }}
                    className={`w-full text-left p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors ${
                      n.isRead ? "" : "bg-brand-50/40"
                    }`}
                  >
                    <span className={`text-2xl ${meta.tone}`}>{meta.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={`text-sm ${n.isRead ? "text-slate-700" : "font-semibold text-slate-900"}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{n.body}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(n.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-2" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
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
