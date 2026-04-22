import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import { Landing } from "@/pages/Landing";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { ForgotPassword } from "@/pages/ForgotPassword";
import { ResetPassword } from "@/pages/ResetPassword";
import { NotFound } from "@/pages/NotFound";

import { AdminDashboard } from "@/pages/admin/Dashboard";
import { AdminClients } from "@/pages/admin/Clients";
import { AdminSupervisors } from "@/pages/admin/Supervisors";
import { AdminRequests } from "@/pages/admin/Requests";
import { AdminPlans } from "@/pages/admin/Plans";

import { SupervisorDashboard } from "@/pages/supervisor/Dashboard";
import { SupervisorClients } from "@/pages/supervisor/Clients";

import { ClientDashboard } from "@/pages/client/Dashboard";
import { ClientNewRequest } from "@/pages/client/NewRequest";
import { ClientRequests } from "@/pages/client/Requests";

function ProtectedRoute({ children, role }: { children: React.ReactNode; role: string }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== role) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "supervisor") return <Navigate to="/supervisor" replace />;
    return <Navigate to="/client" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/clients" element={<ProtectedRoute role="admin"><AdminClients /></ProtectedRoute>} />
      <Route path="/admin/supervisors" element={<ProtectedRoute role="admin"><AdminSupervisors /></ProtectedRoute>} />
      <Route path="/admin/requests" element={<ProtectedRoute role="admin"><AdminRequests /></ProtectedRoute>} />
      <Route path="/admin/plans" element={<ProtectedRoute role="admin"><AdminPlans /></ProtectedRoute>} />

      {/* Supervisor */}
      <Route path="/supervisor" element={<ProtectedRoute role="supervisor"><SupervisorDashboard /></ProtectedRoute>} />
      <Route path="/supervisor/clients" element={<ProtectedRoute role="supervisor"><SupervisorClients /></ProtectedRoute>} />
      <Route path="/supervisor/new-client" element={<ProtectedRoute role="supervisor"><SupervisorClients /></ProtectedRoute>} />

      {/* Client */}
      <Route path="/client" element={<ProtectedRoute role="client"><ClientDashboard /></ProtectedRoute>} />
      <Route path="/client/new-request" element={<ProtectedRoute role="client"><ClientNewRequest /></ProtectedRoute>} />
      <Route path="/client/requests" element={<ProtectedRoute role="client"><ClientRequests /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
