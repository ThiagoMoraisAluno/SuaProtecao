import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RequestStatus, ClientStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateString));
}

export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function getRequestStatusConfig(status: RequestStatus): {
  label: string;
  className: string;
} {
  const map: Record<RequestStatus, { label: string; className: string }> = {
    pending: { label: "Pendente", className: "bg-amber-50 text-amber-700 border border-amber-200" },
    in_progress: { label: "Em Atendimento", className: "bg-blue-50 text-blue-700 border border-blue-200" },
    completed: { label: "Concluído", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    denied: { label: "Negado", className: "bg-red-50 text-red-700 border border-red-200" },
    analyzing: { label: "Em Análise", className: "bg-purple-50 text-purple-700 border border-purple-200" },
    approved: { label: "Aprovado", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  };
  return map[status] || { label: status, className: "bg-slate-50 text-slate-700" };
}

export function getClientStatusConfig(status: ClientStatus): {
  label: string;
  className: string;
} {
  const map: Record<ClientStatus, { label: string; className: string }> = {
    active: { label: "Ativo", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    inactive: { label: "Inativo", className: "bg-slate-50 text-slate-600 border border-slate-200" },
    defaulter: { label: "Inadimplente", className: "bg-red-50 text-red-700 border border-red-200" },
  };
  return map[status] || { label: status, className: "bg-slate-50 text-slate-700" };
}

export function getServiceTypeLabel(type: string): string {
  const map: Record<string, string> = {
    plumber: "Encanador",
    electrician: "Eletricista",
    mason: "Pedreiro",
    locksmith: "Chaveiro",
    painter: "Pintor",
    carpenter: "Carpinteiro",
    cleaner: "Diarista",
    other: "Outro",
  };
  return map[type] || type;
}

export function getCoverageTypeLabel(type: string): string {
  const map: Record<string, string> = {
    theft: "Roubo / Furto",
    flood: "Enchente / Alagamento",
    structural_damage: "Dano Estrutural",
    fire: "Incêndio",
    other: "Outro Sinistro",
  };
  return map[type] || type;
}

export function getPlanLabel(planId: string): string {
  const map: Record<string, string> = {
    basic: "Plano Básico",
    intermediate: "Plano Intermediário",
    premium: "Plano Premium",
  };
  return map[planId] || planId;
}
