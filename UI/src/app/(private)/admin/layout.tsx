"use client";

import {
  LayoutDashboard, Users, UserCheck, FileText, CreditCard, Shield,
} from "lucide-react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

const navItems = [
  { path: "/admin/dashboard",   label: "Dashboard",    icon: LayoutDashboard },
  { path: "/admin/clients",     label: "Clientes",     icon: Users },
  { path: "/admin/supervisors", label: "Supervisores", icon: UserCheck },
  { path: "/admin/requests",    label: "Chamados",     icon: FileText },
  { path: "/admin/plans",       label: "Planos",       icon: CreditCard },
];

const badge = {
  label: "Admin Master",
  icon: Shield,
  className: "bg-amber-50 text-amber-700 border border-amber-200",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={navItems} badge={badge} dashboardPath="/admin/dashboard">
      {children}
    </DashboardLayout>
  );
}
