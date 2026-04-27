"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
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
  const [user, setUser] = useState<AuthUser | null>(() => tokenService.getUser());
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      // Chama o proxy Next.js que seta o refresh_token como cookie httpOnly
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

      const authUser: AuthUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        phone: data.user.phone,
      };

      // Salva access_token em sessionStorage + user em cookie regular (para o middleware)
      tokenService.saveTokens(data.accessToken, authUser);
      setUser(authUser);
      return authUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const accessToken = tokenService.getAccessToken();
      // Chama o proxy Next.js que limpa o cookie httpOnly refresh_token
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
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
