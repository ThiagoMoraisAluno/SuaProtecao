import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlanResponseDto } from './dto/plan-response.dto';
import {
  IPlansRepository,
  PLANS_REPOSITORY_TOKEN,
} from './interfaces/plans-repository.interface';

@Injectable()
export class PlansService {
  constructor(
    @Inject(PLANS_REPOSITORY_TOKEN)
    private readonly plansRepository: IPlansRepository,
  ) {}

  async findAll(): Promise<PlanResponseDto[]> {
    return this.plansRepository.findAll();
  }

  async findOne(id: string): Promise<PlanResponseDto> {
    const plan = await this.plansRepository.findById(id);
    if (!plan) throw new NotFoundException('Plano não encontrado.');
    return plan;
  }

  async update(id: string, dto: UpdatePlanDto): Promise<PlanResponseDto> {
    const plan = await this.plansRepository.findById(id);
    if (!plan) throw new NotFoundException('Plano não encontrado.');
    return this.plansRepository.update(id, dto);
  }
}
