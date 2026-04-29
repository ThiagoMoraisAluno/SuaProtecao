import api from "@/infrastructure/http/api";
import type { Plan } from "@/domain/entities";
import type {
  IPlanRepository,
  CreatePlanInput,
  UpdatePlanInput,
} from "@/domain/repositories/IPlanRepository";

export const planRepository: IPlanRepository = {
  async findAll(): Promise<Plan[]> {
    const { data } = await api.get<Plan[]>("/plans");
    return data;
  },

  async create(plan: CreatePlanInput): Promise<Plan> {
    const { data } = await api.post<Plan>("/plans", plan);
    return data;
  },

  async update(id: string, updates: UpdatePlanInput): Promise<Plan> {
    const { data } = await api.patch<Plan>(`/plans/${id}`, updates);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/plans/${id}`);
  },
};
