import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupervisorsService } from './supervisors.service';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('supervisors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('supervisors')
export class SupervisorsController {
  constructor(private readonly supervisorsService: SupervisorsService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Cria novo supervisor (Admin)' })
  create(@Body() dto: CreateSupervisorDto) {
    return this.supervisorsService.create(dto);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Lista todos os supervisores (Admin)' })
  findAll() {
    return this.supervisorsService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Detalhe do supervisor (Admin ou próprio supervisor)' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.supervisorsService.findOne(id, user);
  }

  @Get(':id/clients')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Lista clientes do supervisor' })
  getClients(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.supervisorsService.getClients(id, user);
  }

  @Get(':id/commission')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Comissão estimada do supervisor' })
  getCommission(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.supervisorsService.getCommission(id, user);
  }
}
