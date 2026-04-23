"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, User, Mail, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usersService } from "@/services/users.service";
import { toast } from "sonner";

export default function ClientProfilePage() {
  const { user, login } = useAuth();
  const qc = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile-me"],
    queryFn: () => usersService.getMe(),
  });

  const [name, setName] = useState(profile?.name || user?.name || "");
  const [phone, setPhone] = useState(profile?.phone || user?.phone || "");

  const updateMutation = useMutation({
    mutationFn: () => usersService.updateMe({ name, phone }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile-me"] });
      toast.success("Perfil atualizado com sucesso!");
    },
    onError: () => toast.error("Erro ao atualizar perfil."),
  });

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Meu Perfil</h1>
        <p className="text-slate-500 text-sm mt-1">Gerencie suas informações pessoais</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{(profile?.name || user?.name || "C").charAt(0)}</span>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{profile?.name || user?.name}</p>
            <p className="text-sm text-slate-500">{profile?.email || user?.email}</p>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(); }} className="space-y-5">
          <div>
            <label className="form-label">
              <User size={14} className="inline mr-1.5" />
              Nome Completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="form-label">
              <Mail size={14} className="inline mr-1.5" />
              E-mail
            </label>
            <input
              type="email"
              value={profile?.email || user?.email || ""}
              disabled
              className="form-input opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1">O e-mail não pode ser alterado</p>
          </div>
          <div>
            <label className="form-label">
              <Phone size={14} className="inline mr-1.5" />
              Telefone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-input"
              placeholder="(00) 00000-0000"
            />
          </div>

          <button type="submit" disabled={updateMutation.isPending} className="btn-primary w-full justify-center py-3.5">
            {updateMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
            {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </div>
    </div>
  );
}
