import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PlanRulesService } from './plan-rules.service';
import { SetPlanRuleDto } from './dto/set-plan-rule.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('plans/:planId/service-rules')
export class PlanRulesController {
  constructor(private readonly plansRulesService: PlanRulesService) {}

  @Get()
  @ApiOperation({
    summary:
      'Lista as regras de serviço aplicadas ao plano (autenticado — usado pelo cliente para montar a lista de serviços disponíveis)',
  })
  list(@Param('planId') planId: string) {
    return this.plansRulesService.findAllByPlan(planId);
  }

  @Put(':serviceId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Cria ou atualiza regra do serviço no plano (Admin)' })
  upsert(
    @Param('planId') planId: string,
    @Param('serviceId') serviceId: string,
    @Body() dto: SetPlanRuleDto,
  ) {
    return this.plansRulesService.upsert(planId, serviceId, dto);
  }

  @Delete(':serviceId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove regra do serviço no plano (Admin)' })
  remove(
    @Param('planId') planId: string,
    @Param('serviceId') serviceId: string,
  ) {
    return this.plansRulesService.remove(planId, serviceId);
  }
}
