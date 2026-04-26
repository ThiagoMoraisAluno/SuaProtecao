import api from "@/infrastructure/http/api";
import { createBaseRepository } from "./base.repository";
import type { Supervisor, Client } from "@/domain/entities";
import type {
  ISupervisorRepository,
  CreateSupervisorDto,
  CommissionInfo,
} from "@/domain/repositories/ISupervisorRepository";

export const supervisorRepository: ISupervisorRepository = {
  ...createBaseRepository<Supervisor>("/supervisors"),

  async create(dto: CreateSupervisorDto): Promise<Supervisor> {
    const { data } = await api.post<Supervisor>("/supervisors", dto);
    return data;
  },

  async getClients(id: string): Promise<Client[]> {
    const { data } = await api.get<Client[]>(`/supervisors/${id}/clients`);
    return data;
  },

  async getCommission(id: string): Promise<CommissionInfo> {
    const { data } = await api.get<CommissionInfo>(`/supervisors/${id}/commission`);
    return data;
  },
};
