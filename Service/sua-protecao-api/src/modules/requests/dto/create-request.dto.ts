import { IsEnum } from 'class-validator';
import { RequestType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { CreateServiceRequestDto } from './create-service-request.dto';
import { CreateCoverageRequestDto } from './create-coverage-request.dto';
import { IntersectionType } from '@nestjs/swagger';

export class CreateRequestTypeDto {
  @ApiProperty({ enum: RequestType })
  @IsEnum(RequestType)
  type!: RequestType;
}

export class CreateFullRequestDto extends IntersectionType(
  CreateRequestTypeDto,
  IntersectionType(CreateServiceRequestDto, CreateCoverageRequestDto),
) {}
