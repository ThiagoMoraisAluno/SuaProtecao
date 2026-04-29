import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IServicesRepository } from './interfaces/services-repository.interface';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceResponseDto } from './dto/service-response.dto';

@Injectable()
export class ServicesRepository implements IServicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(onlyActive: boolean): Promise<ServiceResponseDto[]> {
    const services = await this.prisma.service.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { name: 'asc' },
    });
    return services.map(this.map);
  }

  async findById(id: string): Promise<ServiceResponseDto | null> {
    const service = await this.prisma.service.findUnique({ where: { id } });
    return service ? this.map(service) : null;
  }

  async findBySlug(slug: string): Promise<ServiceResponseDto | null> {
    const service = await this.prisma.service.findUnique({ where: { slug } });
    return service ? this.map(service) : null;
  }

  async create(dto: CreateServiceDto): Promise<ServiceResponseDto> {
    const created = await this.prisma.service.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        icon: dto.icon ?? null,
        isActive: dto.isActive ?? true,
      },
    });
    return this.map(created);
  }

  async update(id: string, dto: UpdateServiceDto): Promise<ServiceResponseDto> {
    const updated = await this.prisma.service.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
    return this.map(updated);
  }

  async toggleActive(
    id: string,
    isActive: boolean,
  ): Promise<ServiceResponseDto> {
    const updated = await this.prisma.service.update({
      where: { id },
      data: { isActive },
    });
    return this.map(updated);
  }

  async countRules(serviceId: string): Promise<number> {
    return this.prisma.planServiceRule.count({ where: { serviceId } });
  }

  async countRequests(serviceId: string): Promise<number> {
    return this.prisma.request.count({ where: { serviceId } });
  }

  private map(service: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): ServiceResponseDto {
    return {
      id: service.id,
      name: service.name,
      slug: service.slug,
      icon: service.icon,
      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}
