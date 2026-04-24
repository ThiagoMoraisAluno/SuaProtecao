import { ClientStatus } from '@prisma/client';
import { CreateClientDto } from '../dto/create-client.dto';
import { AddClientAssetDto } from '../dto/add-client-asset.dto';
import {
  ClientResponseDto,
  ClientListItemDto,
} from '../dto/client-response.dto';

export interface CreateClientData {
  dto: CreateClientDto;
  passwordHash: string;
  totalAssetsValue: number;
  supervisorId: string | undefined;
}

export interface IClientsRepository {
  findAll(supervisorId?: string): Promise<ClientListItemDto[]>;
  findById(id: string): Promise<ClientResponseDto | null>;
  findByUserId(userId: string): Promise<ClientResponseDto | null>;
  findSupervisorId(clientId: string): Promise<string | null>;
  existsByEmail(email: string): Promise<boolean>;
  existsByCpf(cpf: string): Promise<boolean>;
  existsPlan(planId: string): Promise<boolean>;
  existsSupervisor(supervisorId: string): Promise<boolean>;
  create(data: CreateClientData): Promise<string>;
  updateStatus(id: string, status: ClientStatus): Promise<void>;
  addAsset(clientId: string, dto: AddClientAssetDto): Promise<void>;
  removeAsset(clientId: string, assetId: string): Promise<boolean>;
  recalculateAssetsValue(clientId: string): Promise<void>;
  updatePlan(
    clientId: string,
    planId: string,
    supervisorId?: string | null,
  ): Promise<void>;
  incrementServicesUsed(clientId: string): Promise<void>;
}

export const CLIENTS_REPOSITORY_TOKEN = 'CLIENTS_REPOSITORY';
