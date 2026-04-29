import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
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

  async create(dto: CreatePlanDto): Promise<PlanResponseDto> {
    if (await this.plansRepository.existsByType(dto.type)) {
      throw new ConflictException(
        'Já existe um plano com este tipo. Use PATCH para atualizar.',
      );
    }
    return this.plansRepository.create(dto);
  }

  async update(id: string, dto: UpdatePlanDto): Promise<PlanResponseDto> {
    const plan = await this.plansRepository.findById(id);
    if (!plan) throw new NotFoundException('Plano não encontrado.');
    return this.plansRepository.update(id, dto);
  }

  async delete(id: string): Promise<{ message: string }> {
    const plan = await this.plansRepository.findById(id);
    if (!plan) throw new NotFoundException('Plano não encontrado.');

    const linkedClients = await this.plansRepository.countClients(id);
    if (linkedClients > 0) {
      throw new BadRequestException(
        `Plano não pode ser excluído: ${linkedClients} cliente(s) vinculado(s). ` +
          'Migre os clientes para outro plano antes de excluir.',
      );
    }

    await this.plansRepository.delete(id);
    return { message: 'Plano excluído com sucesso.' };
  }
}
