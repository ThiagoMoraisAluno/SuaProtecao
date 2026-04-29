import type { Service } from "@/domain/entities";

export type CreateServiceInput = {
  name: string;
  slug: string;
  icon?: string;
  isActive?: boolean;
};

export type UpdateServiceInput = Partial<CreateServiceInput>;

export interface IServiceRepository {
  findAll(includeInactive?: boolean): Promise<Service[]>;
  create(input: CreateServiceInput): Promise<Service>;
  update(id: string, input: UpdateServiceInput): Promise<Service>;
  toggle(id: string): Promise<Service>;
}
