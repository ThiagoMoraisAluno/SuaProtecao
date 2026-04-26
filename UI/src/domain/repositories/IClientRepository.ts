import type { Client, ClientStatus, ClientAsset } from "@/domain/entities";

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

export interface IClientRepository {
  findAll(): Promise<Client[]>;
  findOne(id: string): Promise<Client>;
  create(dto: CreateClientDto): Promise<Client>;
  updateStatus(id: string, status: ClientStatus): Promise<void>;
  addAsset(id: string, asset: ClientAsset): Promise<void>;
  removeAsset(id: string, assetId: string): Promise<void>;
  updatePlan(id: string, planId: string): Promise<void>;
}
