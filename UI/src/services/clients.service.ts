import api from "@/lib/api";
import type { Client, ClientStatus, ClientAsset } from "@/types";

export interface CreateClientDto {
  name: string;
  email: string;
  phone?: string;
  cpf: string;
  password: string;
  planId: string;
  supervisorId: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  assets: ClientAsset[];
  totalAssetsValue: number;
}

export const clientsService = {
  async create(dto: CreateClientDto): Promise<Client> {
    const { data } = await api.post<Client>("/clients", dto);
    return data;
  },

  async findAll(): Promise<Client[]> {
    const { data } = await api.get<Client[]>("/clients");
    return data;
  },

  async findOne(id: string): Promise<Client> {
    const { data } = await api.get<Client>(`/clients/${id}`);
    return data;
  },

  async updateStatus(id: string, status: ClientStatus): Promise<void> {
    await api.patch(`/clients/${id}/status`, { status });
  },

  async addAsset(id: string, asset: ClientAsset): Promise<void> {
    await api.post(`/clients/${id}/assets`, asset);
  },

  async removeAsset(id: string, assetId: string): Promise<void> {
    await api.delete(`/clients/${id}/assets/${assetId}`);
  },

  async updatePlan(id: string, planId: string): Promise<void> {
    await api.patch(`/clients/${id}/plan`, { planId });
  },
};
