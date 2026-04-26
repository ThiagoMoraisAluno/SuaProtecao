import api from "@/lib/api";
import type { StoredUser } from "@/infrastructure/auth/tokenService";

export const usersService = {
  async getMe(): Promise<StoredUser> {
    const { data } = await api.get<StoredUser>("/users/me");
    return data;
  },

  async updateMe(updates: Partial<Pick<StoredUser, "name" | "phone">>): Promise<StoredUser> {
    const { data } = await api.patch<StoredUser>("/users/me", updates);
    return data;
  },
};
