import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequestsService } from './requests.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { CreateCoverageRequestDto } from './dto/create-coverage-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post('service')
  @Roles('client')
  @ApiOperation({ summary: 'Abre chamado de serviço (Cliente)' })
  createService(
    @Body() dto: CreateServiceRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.requestsService.createService(dto, user);
  }

  @Post('coverage')
  @Roles('client')
  @ApiOperation({ summary: 'Abre chamado de cobertura (Cliente)' })
  createCoverage(
    @Body() dto: CreateCoverageRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.requestsService.createCoverage(dto, user);
  }

  @Get()
  @Roles('admin', 'client')
  @ApiOperation({ summary: 'Lista chamados (Admin vê todos; Cliente vê os seus)' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.requestsService.findAll(user);
  }

  @Get('my')
  @Roles('client')
  @ApiOperation({ summary: 'Chamados do cliente autenticado' })
  findMy(@CurrentUser() user: JwtPayload) {
    return this.requestsService.findMy(user.sub);
  }

  @Get(':id')
  @Roles('admin', 'client')
  @ApiOperation({ summary: 'Detalhe do chamado' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.requestsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualiza status/notas do chamado (Admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateRequestDto) {
    return this.requestsService.update(id, dto);
  }
}
