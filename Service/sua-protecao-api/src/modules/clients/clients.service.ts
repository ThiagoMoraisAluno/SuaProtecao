import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientStatusDto } from './dto/update-client-status.dto';
import { AddClientAssetDto } from './dto/add-client-asset.dto';
import { UpdateClientPlanDto } from './dto/update-client-plan.dto';
import {
  ClientResponseDto,
  ClientListItemDto,
} from './dto/client-response.dto';
import {
  IClientsRepository,
  CLIENTS_REPOSITORY_TOKEN,
} from './interfaces/clients-repository.interface';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class ClientsService {
  constructor(
    @Inject(CLIENTS_REPOSITORY_TOKEN)
    private readonly clientsRepository: IClientsRepository,
    private readonly configService: ConfigService,
  ) {}

  async create(
    dto: CreateClientDto,
    requester: JwtPayload,
  ): Promise<ClientResponseDto> {
    if (await this.clientsRepository.existsByEmail(dto.email)) {
      throw new ConflictException('E-mail já cadastrado.');
    }
    if (await this.clientsRepository.existsByCpf(dto.cpf)) {
      throw new ConflictException('CPF já cadastrado.');
    }
    if (!(await this.clientsRepository.existsPlan(dto.planId))) {
      throw new NotFoundException('Plano não encontrado.');
    }

    let supervisorId = dto.supervisorId;
    if (requester.role === 'supervisor' && !supervisorId) {
      supervisorId = requester.sub;
    }

    if (supervisorId && !(await this.clientsRepository.existsSupervisor(supervisorId))) {
      throw new NotFoundException('Supervisor não encontrado.');
    }

    const rounds = parseInt(
      this.configService.get<string>('BCRYPT_ROUNDS') ?? '12',
      10,
    );
    const passwordHash = await bcrypt.hash(dto.password, rounds);
    const totalAssetsValue = dto.assets.reduce(
      (sum, asset) => sum + asset.estimatedValue,
      0,
    );

    const userId = await this.clientsRepository.create({
      dto,
      passwordHash,
      totalAssetsValue,
      supervisorId,
    });

    const client = await this.clientsRepository.findByUserId(userId);
    return client!;
  }

  async findAll(requester: JwtPayload): Promise<ClientListItemDto[]> {
    const supervisorId =
      requester.role === 'supervisor' ? requester.sub : undefined;
    return this.clientsRepository.findAll(supervisorId);
  }

  async findBysupervisor(
    supervisorId: string,
    requester: JwtPayload,
  ): Promise<ClientListItemDto[]> {
    if (requester.role === 'supervisor' && requester.sub !== supervisorId) {
      throw new ForbiddenException('Acesso negado.');
    }
    return this.clientsRepository.findAll(supervisorId);
  }

  async findMyData(userId: string): Promise<ClientResponseDto> {
    const client = await this.clientsRepository.findByUserId(userId);
    if (!client) throw new NotFoundException('Cliente não encontrado.');
    return client;
  }

  async findOne(id: string, requester: JwtPayload): Promise<ClientResponseDto> {
    const client = await this.clientsRepository.findById(id);
    if (!client) throw new NotFoundException('Cliente não encontrado.');

    if (requester.role === 'client' && requester.sub !== id) {
      throw new ForbiddenException('Acesso negado.');
    }

    if (requester.role === 'supervisor') {
      const supervisorId = await this.clientsRepository.findSupervisorId(id);
      if (supervisorId !== requester.sub) {
        throw new ForbiddenException('Acesso negado.');
      }
    }

    return client;
  }

  async updateStatus(
    id: string,
    dto: UpdateClientStatusDto,
  ): Promise<ClientResponseDto> {
    const client = await this.clientsRepository.findById(id);
    if (!client) throw new NotFoundException('Cliente não encontrado.');
    await this.clientsRepository.updateStatus(id, dto.status);
    return (await this.clientsRepository.findById(id))!;
  }

  async addAsset(
    clientId: string,
    dto: AddClientAssetDto,
  ): Promise<ClientResponseDto> {
    const client = await this.clientsRepository.findById(clientId);
    if (!client) throw new NotFoundException('Cliente não encontrado.');
    await this.clientsRepository.addAsset(clientId, dto);
    await this.clientsRepository.recalculateAssetsValue(clientId);
    return (await this.clientsRepository.findById(clientId))!;
  }

  async removeAsset(
    clientId: string,
    assetId: string,
  ): Promise<{ message: string }> {
    const found = await this.clientsRepository.removeAsset(clientId, assetId);
    if (!found) throw new NotFoundException('Bem não encontrado.');
    await this.clientsRepository.recalculateAssetsValue(clientId);
    return { message: 'Bem removido com sucesso.' };
  }

  async updatePlan(
    clientId: string,
    dto: UpdateClientPlanDto,
  ): Promise<ClientResponseDto> {
    const client = await this.clientsRepository.findById(clientId);
    if (!client) throw new NotFoundException('Cliente não encontrado.');
    if (!(await this.clientsRepository.existsPlan(dto.planId))) {
      throw new NotFoundException('Plano não encontrado.');
    }
    await this.clientsRepository.updatePlan(
      clientId,
      dto.planId,
      dto.supervisorId,
    );
    return (await this.clientsRepository.findById(clientId))!;
  }

  async incrementServicesUsed(
    clientId: string,
  ): Promise<{ message: string }> {
    const client = await this.clientsRepository.findById(clientId);
    if (!client) throw new NotFoundException('Cliente não encontrado.');
    await this.clientsRepository.incrementServicesUsed(clientId);
    return { message: 'Serviço incrementado.' };
  }
}
