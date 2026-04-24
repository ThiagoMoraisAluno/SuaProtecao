import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import {
  SupervisorResponseDto,
  SupervisorClientItemDto,
  SupervisorCommissionDto,
} from './dto/supervisor-response.dto';
import {
  ISupervisorsRepository,
  SUPERVISORS_REPOSITORY_TOKEN,
} from './interfaces/supervisors-repository.interface';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class SupervisorsService {
  constructor(
    @Inject(SUPERVISORS_REPOSITORY_TOKEN)
    private readonly supervisorsRepository: ISupervisorsRepository,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateSupervisorDto): Promise<SupervisorResponseDto> {
    if (await this.supervisorsRepository.existsByEmail(dto.email)) {
      throw new ConflictException('E-mail já cadastrado.');
    }

    const rounds = parseInt(
      this.configService.get<string>('BCRYPT_ROUNDS') ?? '12',
      10,
    );
    const passwordHash = await bcrypt.hash(dto.password, rounds);
    const id = await this.supervisorsRepository.create(dto, passwordHash);
    return (await this.supervisorsRepository.findById(id))!;
  }

  async findAll(): Promise<SupervisorResponseDto[]> {
    return this.supervisorsRepository.findAll();
  }

  async findOne(id: string, requester: JwtPayload): Promise<SupervisorResponseDto> {
    if (requester.role === 'supervisor' && requester.sub !== id) {
      throw new ForbiddenException('Acesso negado.');
    }
    const supervisor = await this.supervisorsRepository.findById(id);
    if (!supervisor) throw new NotFoundException('Supervisor não encontrado.');
    return supervisor;
  }

  async getClients(
    supervisorId: string,
    requester: JwtPayload,
  ): Promise<SupervisorClientItemDto[]> {
    if (requester.role === 'supervisor' && requester.sub !== supervisorId) {
      throw new ForbiddenException('Acesso negado.');
    }
    return this.supervisorsRepository.findClients(supervisorId);
  }

  async getCommission(
    supervisorId: string,
    requester: JwtPayload,
  ): Promise<SupervisorCommissionDto> {
    if (requester.role === 'supervisor' && requester.sub !== supervisorId) {
      throw new ForbiddenException('Acesso negado.');
    }
    const result = await this.supervisorsRepository.getCommission(supervisorId);
    if (!result) throw new NotFoundException('Supervisor não encontrado.');
    return result;
  }
}
