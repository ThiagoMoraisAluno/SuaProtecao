import api from "@/lib/api";
import type { AuthUser } from "@/contexts/AuthContext";

export const usersService = {
  async getMe(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>("/users/me");
    return data;
  },

  async updateMe(updates: Partial<Pick<AuthUser, "name" | "phone">>): Promise<AuthUser> {
    const { data } = await api.patch<AuthUser>("/users/me", updates);
    return data;
  },
};
