import { CreateServiceDto } from '../dto/create-service.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';
import { ServiceResponseDto } from '../dto/service-response.dto';

export interface IServicesRepository {
  findAll(onlyActive: boolean): Promise<ServiceResponseDto[]>;
  findById(id: string): Promise<ServiceResponseDto | null>;
  findBySlug(slug: string): Promise<ServiceResponseDto | null>;
  create(dto: CreateServiceDto): Promise<ServiceResponseDto>;
  update(id: string, dto: UpdateServiceDto): Promise<ServiceResponseDto>;
  toggleActive(id: string, isActive: boolean): Promise<ServiceResponseDto>;
  countRules(serviceId: string): Promise<number>;
  countRequests(serviceId: string): Promise<number>;
}

export const SERVICES_REPOSITORY_TOKEN = 'SERVICES_REPOSITORY';
