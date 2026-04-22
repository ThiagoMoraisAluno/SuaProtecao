import { IsEnum } from 'class-validator';
import { ClientStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClientStatusDto {
  @ApiProperty({ enum: ClientStatus })
  @IsEnum(ClientStatus)
  status!: ClientStatus;
}
