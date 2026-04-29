import { IsDateString, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceRequestDto {
  @ApiProperty({ description: 'ID do serviço (catálogo dinâmico)' })
  @IsUUID()
  serviceId!: string;

  @ApiProperty({ minLength: 10 })
  @IsString()
  @MinLength(10)
  description!: string;

  @ApiProperty({ description: 'ISO date string. Não pode ser data passada.' })
  @IsDateString()
  desiredDate!: string;
}
