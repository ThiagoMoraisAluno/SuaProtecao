"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(
        axios.isAxiosError<{ message: string }>(err)
          ? (err.response?.data?.message ?? "Erro ao enviar e-mail. Tente novamente.")
          : "Erro ao enviar e-mail. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-10 text-center">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white font-display">Recuperar Senha</h1>
            <p className="text-brand-200 text-sm mt-1">Sua Proteção | Reparo Certo</p>
          </div>

          <div className="px-8 py-8">
            {!sent ? (
              <>
                <p className="text-slate-500 text-sm text-center mb-6">
                  Informe o e-mail cadastrado e enviaremos um link para você redefinir sua senha.
                </p>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="form-label">E-mail cadastrado</label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="form-input"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary justify-center py-3.5 text-base"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail size={18} />}
                    {loading ? "Enviando..." : "Enviar Link de Recuperação"}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4 animate-fade-in">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 font-display mb-2">E-mail enviado!</h2>
                <p className="text-slate-500 text-sm mb-1">Enviamos um link de recuperação para:</p>
                <p className="font-semibold text-brand-700 text-sm mb-5 break-all">{email}</p>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  Verifique sua caixa de entrada e também a pasta de spam. O link expira em 1 hora.
                </p>
                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
                >
                  Reenviar para outro e-mail
                </button>
              </div>
            )}

            <div className="mt-7 pt-6 border-t border-slate-100 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ArrowLeft size={16} />
                Voltar para o Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
