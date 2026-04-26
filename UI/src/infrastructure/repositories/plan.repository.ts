import api from "@/infrastructure/http/api";
import type { Plan } from "@/domain/entities";
import type { IPlanRepository } from "@/domain/repositories/IPlanRepository";

export const planRepository: IPlanRepository = {
  async findAll(): Promise<Plan[]> {
    const { data } = await api.get<Plan[]>("/plans");
    return data;
  },

  async update(id: string, updates: Partial<Plan>): Promise<Plan> {
    const { data } = await api.patch<Plan>(`/plans/${id}`, updates);
    return data;
  },
};
