import { IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClientPlanDto {
  @ApiProperty()
  @IsUUID()
  planId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  supervisorId?: string;
}
