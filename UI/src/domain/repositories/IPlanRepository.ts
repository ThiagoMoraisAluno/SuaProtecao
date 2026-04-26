import type { Plan } from "@/domain/entities";

export interface IPlanRepository {
  findAll(): Promise<Plan[]>;
  update(id: string, updates: Partial<Plan>): Promise<Plan>;
}
