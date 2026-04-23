import api from "@/lib/api";
import type { Plan } from "@/types";

export const plansService = {
  async findAll(): Promise<Plan[]> {
    const { data } = await api.get<Plan[]>("/plans");
    return data;
  },

  async update(id: string, updates: Partial<Plan>): Promise<Plan> {
    const { data } = await api.patch<Plan>(`/plans/${id}`, updates);
    return data;
  },
};
