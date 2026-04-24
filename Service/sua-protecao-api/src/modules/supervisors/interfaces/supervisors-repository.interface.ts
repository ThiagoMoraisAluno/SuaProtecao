import { CreateSupervisorDto } from '../dto/create-supervisor.dto';
import {
  SupervisorResponseDto,
  SupervisorClientItemDto,
  SupervisorCommissionDto,
} from '../dto/supervisor-response.dto';

export interface ISupervisorsRepository {
  existsByEmail(email: string): Promise<boolean>;
  create(dto: CreateSupervisorDto, passwordHash: string): Promise<string>;
  findAll(): Promise<SupervisorResponseDto[]>;
  findById(id: string): Promise<SupervisorResponseDto | null>;
  findClients(supervisorId: string): Promise<SupervisorClientItemDto[]>;
  getCommission(supervisorId: string): Promise<SupervisorCommissionDto | null>;
}

export const SUPERVISORS_REPOSITORY_TOKEN = 'SUPERVISORS_REPOSITORY';
