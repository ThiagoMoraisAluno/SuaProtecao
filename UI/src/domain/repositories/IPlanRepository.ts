import type { Plan } from "@/domain/entities";

export type CreatePlanInput = Omit<Plan, "id">;
export type UpdatePlanInput = Partial<Omit<Plan, "id">>;

export interface IPlanRepository {
  findAll(): Promise<Plan[]>;
  create(plan: CreatePlanInput): Promise<Plan>;
  update(id: string, updates: UpdatePlanInput): Promise<Plan>;
  remove(id: string): Promise<void>;
}
