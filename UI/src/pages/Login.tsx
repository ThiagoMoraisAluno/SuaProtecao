import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, ArrowRight, Loader2, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await signIn(email, password);
      toast.success(`Bem-vindo(a), ${user.name}!`);
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "supervisor") navigate("/supervisor");
      else navigate("/client");
    } catch (err: any) {
      toast.error(err.message || "E-mail ou senha incorretos.");
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: "Admin Master", email: "admin@demo.com", color: "amber" },
    { role: "Supervisor", email: "supervisor@demo.com", color: "brand" },
    { role: "Cliente", email: "cliente@demo.com", color: "emerald" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-10 text-center">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white font-display">Sua Proteção</h1>
            <p className="text-brand-200 text-sm mt-1">Reparo Certo — Acesse sua conta</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="form-label">E-mail</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="form-input"
                />
              </div>

              <div>
                <label htmlFor="password" className="form-label">Senha</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="form-input pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center py-3.5 text-base"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {loading ? "Entrando..." : "Entrar"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>

              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-xs text-slate-400 hover:text-brand-600 transition-colors"
                >
                  Esqueci minha senha
                </Link>
              </div>
            </form>

            {/* Demo Accounts */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-3 text-center">CONTAS DE DEMONSTRAÇÃO</p>
              <div className="space-y-2">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => { setEmail(acc.email); setPassword("123456"); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all text-sm group"
                  >
                    <span className="font-medium text-slate-700">{acc.role}</span>
                    <span className="text-xs text-slate-400 group-hover:text-slate-600 font-mono">{acc.email}</span>
                  </button>
                ))}
                <p className="text-center text-xs text-slate-400 mt-2">
                  Senha: <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">123456</code>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition-all"
          >
            <UserPlus size={17} />
            Criar nova conta
          </Link>
          <div className="text-center">
            <Link to="/" className="text-sm text-white/50 hover:text-white transition-colors">
              ← Voltar para o site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
