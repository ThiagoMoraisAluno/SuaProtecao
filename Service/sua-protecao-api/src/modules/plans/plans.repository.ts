import { Injectable } from '@nestjs/common';
import { BillingCycle, PlanType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { IPlansRepository } from './interfaces/plans-repository.interface';
import { CreatePlanDto } from './dto/create-plan.dto';
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

  async existsByType(type: string): Promise<boolean> {
    const plan = await this.prisma.plan.findUnique({
      where: { type: type as PlanType },
      select: { id: true },
    });
    return !!plan;
  }

  async create(dto: CreatePlanDto): Promise<PlanResponseDto> {
    const created = await this.prisma.plan.create({
      data: {
        type: dto.type,
        name: dto.name,
        price: dto.price,
        servicesPerMonth: dto.servicesPerMonth,
        coverageLimit: dto.coverageLimit,
        features: dto.features,
        color: dto.color ?? 'brand',
        popular: dto.popular ?? false,
        billingCycle: dto.billingCycle ?? BillingCycle.monthly,
      },
    });
    return this.mapPlan(created);
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
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.popular !== undefined && { popular: dto.popular }),
        ...(dto.billingCycle !== undefined && {
          billingCycle: dto.billingCycle,
        }),
      },
    });
    return this.mapPlan(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.plan.delete({ where: { id } });
  }

  async countClients(planId: string): Promise<number> {
    return this.prisma.client.count({ where: { planId } });
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
    billingCycle: BillingCycle;
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
      billingCycle: plan.billingCycle,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }
}
