import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiPropertyOptional({
    description:
      'Plano alvo da cobrança. Se omitido, usa o plano atual do cliente.',
  })
  @IsOptional()
  @IsUUID()
  planId?: string;

  @ApiPropertyOptional({
    description:
      'Quando admin/supervisor gera cobrança em nome de um cliente.',
  })
  @IsOptional()
  @IsUUID()
  clientId?: string;
}
