import type { Supervisor, Client } from "@/domain/entities";

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

export interface ISupervisorRepository {
  findAll(): Promise<Supervisor[]>;
  findOne(id: string): Promise<Supervisor>;
  create(dto: CreateSupervisorDto): Promise<Supervisor>;
  getClients(id: string): Promise<Client[]>;
  getCommission(id: string): Promise<CommissionInfo>;
}
