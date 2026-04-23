import api from "@/lib/api";
import type { Supervisor, Client } from "@/types";

export interface CreateSupervisorDto {
  name: string;
  email: string;
  phone?: string;
  commission: number;
  password: string;
}

export interface CommissionInfo {
  supervisorId: string;
  totalClients: number;
  activeClients: number;
  estimatedCommission: number;
}

export const supervisorsService = {
  async create(dto: CreateSupervisorDto): Promise<Supervisor> {
    const { data } = await api.post<Supervisor>("/supervisors", dto);
    return data;
  },

  async findAll(): Promise<Supervisor[]> {
    const { data } = await api.get<Supervisor[]>("/supervisors");
    return data;
  },

  async findOne(id: string): Promise<Supervisor> {
    const { data } = await api.get<Supervisor>(`/supervisors/${id}`);
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
