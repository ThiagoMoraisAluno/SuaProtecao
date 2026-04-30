import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

/**
 * Payload mínimo do webhook Asaas. Mantemos com `IsObject` para o `payment`
 * porque o gateway evolui o schema; só os campos críticos são lidos no
 * service.
 */
export class AsaasWebhookDto {
  @ApiProperty({ example: 'PAYMENT_CONFIRMED' })
  @IsString()
  event!: string;

  @ApiProperty({ description: 'Objeto Payment retornado pelo Asaas' })
  @IsObject()
  payment!: Record<string, unknown>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dateCreated?: string;
}
