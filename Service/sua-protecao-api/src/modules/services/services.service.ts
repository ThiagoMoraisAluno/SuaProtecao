import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceResponseDto } from './dto/service-response.dto';
import {
  IServicesRepository,
  SERVICES_REPOSITORY_TOKEN,
} from './interfaces/services-repository.interface';

@Injectable()
export class ServicesService {
  constructor(
    @Inject(SERVICES_REPOSITORY_TOKEN)
    private readonly servicesRepository: IServicesRepository,
  ) {}

  async findAll(onlyActive = true): Promise<ServiceResponseDto[]> {
    return this.servicesRepository.findAll(onlyActive);
  }

  async findOne(id: string): Promise<ServiceResponseDto> {
    const service = await this.servicesRepository.findById(id);
    if (!service) throw new NotFoundException('Serviço não encontrado.');
    return service;
  }

  async create(dto: CreateServiceDto): Promise<ServiceResponseDto> {
    if (await this.servicesRepository.findBySlug(dto.slug)) {
      throw new ConflictException('Já existe um serviço com este slug.');
    }
    return this.servicesRepository.create(dto);
  }

  async update(id: string, dto: UpdateServiceDto): Promise<ServiceResponseDto> {
    const service = await this.servicesRepository.findById(id);
    if (!service) throw new NotFoundException('Serviço não encontrado.');

    if (dto.slug && dto.slug !== service.slug) {
      const existing = await this.servicesRepository.findBySlug(dto.slug);
      if (existing && existing.id !== id) {
        throw new ConflictException('Já existe outro serviço com este slug.');
      }
    }

    return this.servicesRepository.update(id, dto);
  }

  async toggleActive(id: string): Promise<ServiceResponseDto> {
    const service = await this.servicesRepository.findById(id);
    if (!service) throw new NotFoundException('Serviço não encontrado.');
    return this.servicesRepository.toggleActive(id, !service.isActive);
  }
}
