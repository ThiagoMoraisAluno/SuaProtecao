import { CreatePlanDto } from '../dto/create-plan.dto';
import { UpdatePlanDto } from '../dto/update-plan.dto';
import { PlanResponseDto } from '../dto/plan-response.dto';

export interface IPlansRepository {
  findAll(): Promise<PlanResponseDto[]>;
  findById(id: string): Promise<PlanResponseDto | null>;
  existsByType(type: string): Promise<boolean>;
  create(dto: CreatePlanDto): Promise<PlanResponseDto>;
  update(id: string, dto: UpdatePlanDto): Promise<PlanResponseDto>;
  delete(id: string): Promise<void>;
  countClients(planId: string): Promise<number>;
}

export const PLANS_REPOSITORY_TOKEN = 'PLANS_REPOSITORY';
