import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  IPlanRulesRepository,
  PlanRuleEnforcement,
} from './interfaces/plan-rules-repository.interface';
import { PlanServiceRuleResponseDto } from './dto/plan-rule-response.dto';
import { SetPlanRuleDto } from './dto/set-plan-rule.dto';

type PrismaRuleWithService = {
  id: string;
  planId: string;
  serviceId: string;
  maxPerMonth: number;
  maxPerYear: number;
  coverageLimit: { toString(): string };
  createdAt: Date;
  updatedAt: Date;
  service: {
    name: string;
    slug: string;
    icon: string | null;
    isActive: boolean;
  };
};

@Injectable()
export class PlanRulesRepository implements IPlanRulesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByPlan(planId: string): Promise<PlanServiceRuleResponseDto[]> {
    const rules = await this.prisma.planServiceRule.findMany({
      where: { planId },
      include: { service: true },
      orderBy: { service: { name: 'asc' } },
    });
    return rules.map(this.map);
  }

  async findOne(
    planId: string,
    serviceId: string,
  ): Promise<PlanServiceRuleResponseDto | null> {
    const rule = await this.prisma.planServiceRule.findUnique({
      where: { planId_serviceId: { planId, serviceId } },
      include: { service: true },
    });
    return rule ? this.map(rule) : null;
  }

  async upsert(
    planId: string,
    serviceId: string,
    dto: SetPlanRuleDto,
  ): Promise<PlanServiceRuleResponseDto> {
    const rule = await this.prisma.planServiceRule.upsert({
      where: { planId_serviceId: { planId, serviceId } },
      create: {
        planId,
        serviceId,
        maxPerMonth: dto.maxPerMonth,
        maxPerYear: dto.maxPerYear,
        coverageLimit: dto.coverageLimit,
      },
      update: {
        maxPerMonth: dto.maxPerMonth,
        maxPerYear: dto.maxPerYear,
        coverageLimit: dto.coverageLimit,
      },
      include: { service: true },
    });
    return this.map(rule);
  }

  async remove(planId: string, serviceId: string): Promise<boolean> {
    const result = await this.prisma.planServiceRule.deleteMany({
      where: { planId, serviceId },
    });
    return result.count > 0;
  }

  async findEnforcement(
    planId: string,
    serviceId: string,
  ): Promise<PlanRuleEnforcement | null> {
    const rule = await this.prisma.planServiceRule.findUnique({
      where: { planId_serviceId: { planId, serviceId } },
      select: {
        planId: true,
        serviceId: true,
        maxPerMonth: true,
        maxPerYear: true,
        coverageLimit: true,
      },
    });
    if (!rule) return null;
    return {
      planId: rule.planId,
      serviceId: rule.serviceId,
      maxPerMonth: rule.maxPerMonth,
      maxPerYear: rule.maxPerYear,
      coverageLimit: Number(rule.coverageLimit),
    };
  }

  private map(rule: PrismaRuleWithService): PlanServiceRuleResponseDto {
    return {
      id: rule.id,
      planId: rule.planId,
      serviceId: rule.serviceId,
      serviceName: rule.service.name,
      serviceSlug: rule.service.slug,
      serviceIcon: rule.service.icon,
      serviceIsActive: rule.service.isActive,
      maxPerMonth: rule.maxPerMonth,
      maxPerYear: rule.maxPerYear,
      coverageLimit: Number(rule.coverageLimit),
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }
}
