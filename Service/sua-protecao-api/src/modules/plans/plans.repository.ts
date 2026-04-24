import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IPlansRepository } from './interfaces/plans-repository.interface';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlanResponseDto } from './dto/plan-response.dto';

@Injectable()
export class PlansRepository implements IPlansRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PlanResponseDto[]> {
    const plans = await this.prisma.plan.findMany({
      orderBy: { price: 'asc' },
    });
    return plans.map(this.mapPlan);
  }

  async findById(id: string): Promise<PlanResponseDto | null> {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    return plan ? this.mapPlan(plan) : null;
  }

  async update(id: string, dto: UpdatePlanDto): Promise<PlanResponseDto> {
    const updated = await this.prisma.plan.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.servicesPerMonth !== undefined && {
          servicesPerMonth: dto.servicesPerMonth,
        }),
        ...(dto.coverageLimit !== undefined && {
          coverageLimit: dto.coverageLimit,
        }),
        ...(dto.features !== undefined && { features: dto.features }),
      },
    });
    return this.mapPlan(updated);
  }

  private mapPlan(plan: {
    id: string;
    type: string;
    name: string;
    price: { toString(): string };
    servicesPerMonth: number;
    coverageLimit: { toString(): string };
    features: string[];
    color: string;
    popular: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): PlanResponseDto {
    return {
      id: plan.id,
      type: plan.type,
      name: plan.name,
      price: Number(plan.price),
      servicesPerMonth: plan.servicesPerMonth,
      coverageLimit: Number(plan.coverageLimit),
      features: plan.features,
      color: plan.color,
      popular: plan.popular,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }
}
