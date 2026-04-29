"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, Shield, type LucideIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { WHATSAPP_URL } from "@/constants";
import { NotificationBell } from "@/components/features/NotificationBell";

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

export interface RoleBadge {
  label: string;
  icon: LucideIcon;
  className: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  badge: RoleBadge;
  /** Path do dashboard principal — só ativo em match exato */
  dashboardPath: string;
  /** Gradiente Tailwind para o avatar. Ex: "from-brand-500 to-brand-700" */
  avatarGradient?: string;
  supportLabel?: string;
}

export function DashboardLayout({
  children,
  navItems,
  badge,
  dashboardPath,
  avatarGradient = "from-brand-500 to-brand-700",
  supportLabel = "Suporte WhatsApp",
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (path: string): boolean => {
    if (pathname === path) return true;
    if (path === dashboardPath) return false;
    if (!pathname.startsWith(path)) return false;
    // Evita que rotas pai fiquem ativas quando uma rota filha mais específica está aberta
    return !navItems.some(
      (item) =>
        item.path !== path &&
        item.path.startsWith(path) &&
        pathname.startsWith(item.path)
    );
  };

  const BadgeIcon = badge.icon;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-100 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 font-display leading-tight">Sua Proteção</p>
              <p className="text-xs text-slate-500">Reparo Certo</p>
            </div>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-6 pt-4 pb-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
            <BadgeIcon className="w-3 h-3" />
            {badge.label}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`sidebar-link ${isActive(item.path) ? "sidebar-link-active" : "sidebar-link-inactive"}`}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 space-y-1">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="sidebar-link sidebar-link-inactive text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <span className="text-lg">💬</span>
            {supportLabel}
          </a>
          <button
            onClick={() => logout()}
            className="sidebar-link sidebar-link-inactive w-full text-left text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-100 px-4 lg:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu size={20} className="text-slate-600" />
          </button>
          <div className="flex-1 lg:flex-none">
            <p className="text-sm font-semibold text-slate-500 hidden lg:block">
              {navItems.find((n) => isActive(n.path))?.label ?? ""}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <NotificationBell />
            <div className={`w-8 h-8 bg-gradient-to-br ${avatarGradient} rounded-full flex items-center justify-center`}>
              <span className="text-xs font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
              </span>
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">{user?.name}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
