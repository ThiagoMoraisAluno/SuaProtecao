"use client";

import { LayoutDashboard, Users } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

const navItems = [
  { path: "/supervisor/dashboard", label: "Dashboard",      icon: LayoutDashboard },
  { path: "/supervisor/clients",   label: "Meus Clientes",  icon: Users },
];

const badge = {
  label: "Supervisor",
  icon: Users,
  className: "bg-brand-50 text-brand-700 border border-brand-200",
};

export default function SupervisorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={navItems} badge={badge} dashboardPath="/supervisor/dashboard">
      {children}
    </DashboardLayout>
  );
}
