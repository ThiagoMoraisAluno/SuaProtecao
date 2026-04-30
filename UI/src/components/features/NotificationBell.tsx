"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "@/services/notifications.service";
import { useAuth } from "@/contexts/AuthContext";
import type { Notification, NotificationType } from "@/types";

const POLL_INTERVAL_MS = 30 * 1000;
const DROPDOWN_LIMIT = 10;

const TYPE_LABELS: Record<NotificationType, { icon: string; tone: string }> = {
  request_opened: { icon: "📨", tone: "text-blue-600" },
  request_updated: { icon: "🔄", tone: "text-violet-600" },
  request_closed: { icon: "✅", tone: "text-emerald-600" },
  payment_overdue: { icon: "⚠️", tone: "text-red-600" },
  payment_confirmed: { icon: "💳", tone: "text-emerald-600" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "agora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days} dia${days === 1 ? "" : "s"}`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function NotificationBell() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["notifications", "dropdown"],
    queryFn: () => notificationsService.list({ limit: DROPDOWN_LIMIT }),
    enabled: !!user?.id,
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });

  const unreadCount = data?.unreadCount ?? 0;
  const items: Notification[] = data?.items ?? [];
  const notificationsHref = user?.role
    ? `/${user.role}/notifications`
    : "/login";

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!user) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
        aria-label="Notificações"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Notificações</p>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllMutation.mutate()}
                disabled={markAllMutation.isPending}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1"
              >
                <CheckCheck size={14} /> Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                Nenhuma notificação
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {items.map((n) => {
                  const meta = TYPE_LABELS[n.type] ?? { icon: "🔔", tone: "text-slate-600" };
                  return (
                    <li key={n.id}>
                      <button
                        onClick={() => {
                          if (!n.isRead) markReadMutation.mutate(n.id);
                        }}
                        className={`w-full text-left p-3 flex items-start gap-3 hover:bg-slate-50 transition-colors ${
                          n.isRead ? "" : "bg-brand-50/40"
                        }`}
                      >
                        <span className={`text-lg ${meta.tone}`}>{meta.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${n.isRead ? "text-slate-700" : "font-semibold text-slate-900"} truncate`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-2">{n.body}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                        </div>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="p-3 border-t border-slate-100 bg-slate-50">
            <Link
              href={notificationsHref}
              onClick={() => setOpen(false)}
              className="block text-center text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              Ver todas →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
