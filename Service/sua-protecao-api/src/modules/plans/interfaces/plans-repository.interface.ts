import { UpdatePlanDto } from '../dto/update-plan.dto';
import { PlanResponseDto } from '../dto/plan-response.dto';

export interface IPlansRepository {
  findAll(): Promise<PlanResponseDto[]>;
  findById(id: string): Promise<PlanResponseDto | null>;
  update(id: string, dto: UpdatePlanDto): Promise<PlanResponseDto>;
}

export const PLANS_REPOSITORY_TOKEN = 'PLANS_REPOSITORY';
