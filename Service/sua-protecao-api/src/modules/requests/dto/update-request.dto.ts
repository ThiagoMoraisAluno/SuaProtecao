import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { RequestStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRequestDto {
  @ApiPropertyOptional({ enum: RequestStatus })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adminNotes?: string;

  @ApiPropertyOptional({ description: 'Apenas para coberturas aprovadas' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  approvedAmount?: number;
}
