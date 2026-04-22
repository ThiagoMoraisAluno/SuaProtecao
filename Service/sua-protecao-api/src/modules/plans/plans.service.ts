import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const plans = await this.prisma.plan.findMany({
      orderBy: { price: 'asc' },
    });

    return plans.map((p) => this.mapPlan(p));
  }

  async findOne(id: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Plano não encontrado.');
    }
    return this.mapPlan(plan);
  }

  async update(id: string, dto: UpdatePlanDto) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Plano não encontrado.');
    }

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
  }) {
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
