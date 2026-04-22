import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Eye, EyeOff, Lock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    // Supabase sends recovery token via URL hash — listen to auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });

    // Also check if user already has session from magic link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      } else {
        // Give it 3 seconds for the hash to be processed
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (s) {
              setSessionReady(true);
            } else {
              setSessionError(true);
            }
          });
        }, 3000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não conferem.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(error.message || "Erro ao redefinir senha. Solicite um novo link.");
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);

    // Sign out so user logs in fresh with new password
    setTimeout(async () => {
      await supabase.auth.signOut();
      navigate("/login");
    }, 3000);
  };

  if (sessionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center animate-fade-in">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display mb-2">Link inválido ou expirado</h2>
          <p className="text-slate-500 text-sm mb-6">
            Este link de recuperação não é mais válido. Solicite um novo link de recuperação.
          </p>
          <Link to="/forgot-password" className="btn-primary justify-center w-full py-3">
            Solicitar novo link
          </Link>
          <div className="mt-4">
            <Link to="/login" className="text-sm text-slate-400 hover:text-slate-600">
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display mb-2">Senha redefinida!</h2>
          <p className="text-slate-500 text-sm mb-1">Sua senha foi atualizada com sucesso.</p>
          <p className="text-xs text-slate-400">Redirecionando para o login em instantes...</p>
          <div className="mt-6">
            <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-10 text-center">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white font-display">Nova Senha</h1>
            <p className="text-brand-200 text-sm mt-1">Sua Proteção | Reparo Certo</p>
          </div>

          <div className="px-8 py-8">
            {!sessionReady ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500 text-sm">Verificando link de recuperação...</p>
              </div>
            ) : (
              <>
                <p className="text-slate-500 text-sm text-center mb-6">
                  Escolha uma nova senha para sua conta. Mínimo de 6 caracteres.
                </p>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="form-label">Nova Senha *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="form-input pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Confirmar Nova Senha *</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a nova senha"
                        className="form-input pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-500 mt-1.5">As senhas não conferem</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary justify-center py-3.5 text-base"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock size={18} />}
                    {loading ? "Salvando..." : "Redefinir Senha"}
                  </button>
                </form>
              </>
            )}

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <Link to="/login" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
                Voltar ao Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
