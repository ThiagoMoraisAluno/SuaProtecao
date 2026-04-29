import api from "@/infrastructure/http/api";
import type { Service } from "@/domain/entities";
import type {
  IServiceRepository,
  CreateServiceInput,
  UpdateServiceInput,
} from "@/domain/repositories/IServiceRepository";

export const serviceRepository: IServiceRepository = {
  async findAll(includeInactive = false): Promise<Service[]> {
    const { data } = await api.get<Service[]>("/services", {
      params: includeInactive ? { onlyActive: false } : undefined,
    });
    return data;
  },

  async create(input: CreateServiceInput): Promise<Service> {
    const { data } = await api.post<Service>("/services", input);
    return data;
  },

  async update(id: string, input: UpdateServiceInput): Promise<Service> {
    const { data } = await api.patch<Service>(`/services/${id}`, input);
    return data;
  },

  async toggle(id: string): Promise<Service> {
    const { data } = await api.patch<Service>(`/services/${id}/toggle`);
    return data;
  },
};
