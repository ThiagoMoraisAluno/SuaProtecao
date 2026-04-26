import api from "@/infrastructure/http/api";
import { createBaseRepository } from "./base.repository";
import type { Client, ClientStatus, ClientAsset } from "@/domain/entities";
import type { IClientRepository, CreateClientDto } from "@/domain/repositories/IClientRepository";

export const clientRepository: IClientRepository = {
  ...createBaseRepository<Client>("/clients"),

  async create(dto: CreateClientDto): Promise<Client> {
    const { data } = await api.post<Client>("/clients", dto);
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
