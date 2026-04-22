import { IsDateString, IsEnum, IsString, MinLength } from 'class-validator';
import { ServiceType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceRequestDto {
  @ApiProperty({ enum: ServiceType })
  @IsEnum(ServiceType)
  serviceType!: ServiceType;

  @ApiProperty({ minLength: 10 })
  @IsString()
  @MinLength(10)
  description!: string;

  @ApiProperty({ description: 'ISO date string. Não pode ser data passada.' })
  @IsDateString()
  desiredDate!: string;
}
