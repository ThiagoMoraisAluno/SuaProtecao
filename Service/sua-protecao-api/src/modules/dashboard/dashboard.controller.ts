import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @Roles('admin')
  @ApiOperation({ summary: 'Métricas do admin' })
  getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }

  @Get('supervisor')
  @Roles('supervisor')
  @ApiOperation({ summary: 'Métricas do supervisor autenticado' })
  getSupervisorDashboard(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getSupervisorDashboard(user.sub);
  }

  @Get('client')
  @Roles('client')
  @ApiOperation({ summary: 'Dashboard do cliente autenticado' })
  getClientDashboard(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getClientDashboard(user.sub);
  }
}
