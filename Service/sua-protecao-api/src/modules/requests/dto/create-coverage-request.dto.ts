import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { CoverageType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCoverageRequestDto {
  @ApiProperty({ enum: CoverageType })
  @IsEnum(CoverageType)
  coverageType!: CoverageType;

  @ApiProperty({ minLength: 10 })
  @IsString()
  @MinLength(10)
  description!: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  estimatedLoss!: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceUrls?: string[];
}
