"use client";

import { LayoutDashboard, FileText, PlusCircle, Shield } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

const navItems = [
  { path: "/client/dashboard",              label: "Meu Plano",     icon: LayoutDashboard },
  { path: "/client/requests",               label: "Meus Chamados", icon: FileText },
  { path: "/client/requests/new/service",   label: "Novo Chamado",  icon: PlusCircle },
];

const badge = {
  label: "Cliente",
  icon: Shield,
  className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout
      navItems={navItems}
      badge={badge}
      dashboardPath="/client/dashboard"
      avatarGradient="from-emerald-500 to-emerald-700"
      supportLabel="Falar com suporte"
    >
      {children}
    </DashboardLayout>
  );
}
