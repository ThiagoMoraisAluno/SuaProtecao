import api from "@/lib/api";
import type { UserRole } from "@/types";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
  };
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
    return data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post("/auth/forgot-password", { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post("/auth/reset-password", { token, password });
  },

  async register(params: {
    name: string;
    email: string;
    password: string;
    cpf: string;
    phone: string;
    planId: string;
    address: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
    };
    assets: Array<{ name: string; estimatedValue: number }>;
  }): Promise<void> {
    const { address, ...rest } = params;
    await api.post("/auth/register", {
      ...rest,
      addressStreet: address.street,
      addressNumber: address.number,
      addressComplement: address.complement,
      addressNeighborhood: address.neighborhood,
      addressCity: address.city,
      addressState: address.state,
      addressZipCode: address.zipCode,
    });
  },
};
