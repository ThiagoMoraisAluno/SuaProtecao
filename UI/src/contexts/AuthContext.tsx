"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { tokenService } from "@/infrastructure/auth/tokenService";
import type { StoredUser } from "@/infrastructure/auth/tokenService";
import type { UserRole } from "@/types";

// AuthUser é alias de StoredUser — re-exportado para compatibilidade
export type AuthUser = StoredUser;

interface LoginApiResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
  };
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  // Hidrata o estado do usuário a partir do cookie httpOnly via /api/auth/me.
  // /me retorna 200 com null quando anônimo, então não há 401 ruidoso no console.
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json() as Promise<AuthUser | null>)
      .then((data) => { setUser(data); })
      .catch(() => { setUser(null); })
      .finally(() => { setIsInitializing(false); });
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json() as { message?: string };
        throw new Error(err.message ?? "Credenciais inválidas");
      }

      const data = await res.json() as LoginApiResponse;

      // Salva o access token antes de qualquer fetch subsequente
      tokenService.saveTokens(data.accessToken, data.user as AuthUser);

      // Confirma que o cookie httpOnly user foi gravado pelo servidor.
      // Só após isso o caller pode redirecionar com segurança. Se /me retornar
      // null (cookie não setado), cai no payload do login como fallback.
      const meRes = await fetch("/api/auth/me");
      const meUser = (await meRes.json()) as AuthUser | null;
      const authUser: AuthUser = meUser ?? (data.user as AuthUser);

      setUser(authUser);
      return authUser;
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const accessToken = tokenService.getAccessToken();
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
    } catch {
      // ignora erros de rede — a limpeza local acontece de qualquer forma
    } finally {
      tokenService.clearTokens();
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading: isInitializing || isLoggingIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
