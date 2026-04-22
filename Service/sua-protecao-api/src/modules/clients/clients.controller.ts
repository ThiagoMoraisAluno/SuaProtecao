import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientStatusDto } from './dto/update-client-status.dto';
import { AddClientAssetDto } from './dto/add-client-asset.dto';
import { UpdateClientPlanDto } from './dto/update-client-plan.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Cria novo cliente (Admin ou Supervisor)' })
  create(@Body() dto: CreateClientDto, @CurrentUser() user: JwtPayload) {
    return this.clientsService.create(dto, user);
  }

  @Get()
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Lista clientes (Admin vê todos; Supervisor vê os seus)' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.clientsService.findAll(user);
  }

  @Get('my')
  @Roles('client')
  @ApiOperation({ summary: 'Dados do cliente autenticado' })
  findMyData(@CurrentUser() user: JwtPayload) {
    return this.clientsService.findMyData(user.sub);
  }

  @Get('by-supervisor/:supervisorId')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Clientes de um supervisor específico' })
  findBySupervisor(
    @Param('supervisorId') supervisorId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.clientsService.findBysupervisor(supervisorId, user);
  }

  @Get(':id')
  @Roles('admin', 'supervisor', 'client')
  @ApiOperation({ summary: 'Detalhe do cliente' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.clientsService.findOne(id, user);
  }

  @Patch(':id/status')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualiza status do cliente (Admin)' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateClientStatusDto,
  ) {
    return this.clientsService.updateStatus(id, dto);
  }

  @Post(':id/assets')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Adiciona bem ao imóvel do cliente' })
  addAsset(@Param('id') id: string, @Body() dto: AddClientAssetDto) {
    return this.clientsService.addAsset(id, dto);
  }

  @Delete(':id/assets/:assetId')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Remove bem do imóvel do cliente' })
  removeAsset(@Param('id') id: string, @Param('assetId') assetId: string) {
    return this.clientsService.removeAsset(id, assetId);
  }

  @Patch(':id/plan')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Altera o plano do cliente' })
  updatePlan(
    @Param('id') id: string,
    @Body() dto: UpdateClientPlanDto,
  ) {
    return this.clientsService.updatePlan(id, dto);
  }

  @Post(':id/increment-services')
  @Roles('admin')
  @ApiOperation({ summary: 'Incrementa serviços usados no mês (Admin/interno)' })
  incrementServices(@Param('id') id: string) {
    return this.clientsService.incrementServicesUsed(id);
  }
}
