import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ListPaymentsDto } from './dto/list-payments.dto';
import { AsaasWebhookDto } from './dto/asaas-webhook.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'supervisor', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gera cobrança (cliente: própria; admin/supervisor: para terceiro)' })
  create(
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.paymentsService.create(dto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista pagamentos (cliente: próprios; admin: todos)' })
  list(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListPaymentsDto,
  ) {
    return this.paymentsService.list(user, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Detalhe do pagamento (sincroniza com Asaas se ainda pendente — fallback de webhook)',
  })
  refresh(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.paymentsService.refreshStatus(id, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancela pagamento (Admin)' })
  cancel(@Param('id') id: string) {
    return this.paymentsService.cancel(id);
  }

  /**
   * Webhook público — validação por token no header `asaas-access-token`.
   * Sem JWT guard porque o Asaas é quem chama.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook Asaas (validado por header token)' })
  webhook(
    @Headers('asaas-access-token') token: string | undefined,
    @Body() body: AsaasWebhookDto,
  ) {
    return this.paymentsService.handleWebhook(token, body);
  }
}
