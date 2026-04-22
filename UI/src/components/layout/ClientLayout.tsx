import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, PlusCircle, LogOut, Menu, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { WHATSAPP_URL } from "@/constants";

const navItems = [
  { path: "/client", label: "Meu Plano", icon: LayoutDashboard, exact: true },
  { path: "/client/requests", label: "Meus Chamados", icon: FileText },
  { path: "/client/new-request", label: "Novo Chamado", icon: PlusCircle },
];

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-100 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
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

        <div className="px-6 pt-4 pb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
            <Shield className="w-3 h-3" />
            Cliente
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`sidebar-link ${isActive(item.path, item.exact) ? "sidebar-link-active" : "sidebar-link-inactive"}`}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100 space-y-1">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="sidebar-link sidebar-link-inactive text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <span className="text-lg">💬</span>
            Falar com suporte
          </a>
          <button
            onClick={handleLogout}
            className="sidebar-link sidebar-link-inactive w-full text-left text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-100 px-4 lg:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
            <Menu size={20} className="text-slate-600" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">{user?.name?.charAt(0) || "C"}</span>
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">{user?.name}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
