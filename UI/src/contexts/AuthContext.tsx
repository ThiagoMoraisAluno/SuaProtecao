import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/types";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapSupabaseUser(user: User, role: UserRole, name?: string): AuthUser {
  return {
    id: user.id,
    email: user.email!,
    role,
    name: name || user.user_metadata?.full_name || user.user_metadata?.username || user.email!.split("@")[0],
    phone: user.user_metadata?.phone,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchUserRole(supabaseUser: User): Promise<AuthUser | null> {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("id", supabaseUser.id)
      .maybeSingle();

    if (!data) return null;
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("username")
      .eq("id", supabaseUser.id)
      .maybeSingle();

    return mapSupabaseUser(supabaseUser, data.role as UserRole, profile?.username);
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (mounted && session?.user) {
        const authUser = await fetchUserRole(session.user);
        if (mounted) setUser(authUser);
      }
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_IN" && session?.user) {
        const authUser = await fetchUserRole(session.user);
        setUser(authUser);
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        const authUser = await fetchUserRole(session.user);
        setUser(authUser);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const authUser = await fetchUserRole(data.user);
    if (!authUser) throw new Error("Usuário não encontrado no sistema.");
    return authUser;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
