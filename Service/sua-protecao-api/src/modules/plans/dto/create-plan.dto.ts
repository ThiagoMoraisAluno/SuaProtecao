import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillingCycle, PlanType } from '@prisma/client';

export class CreatePlanDto {
  @ApiProperty({ enum: PlanType })
  @IsEnum(PlanType)
  type!: PlanType;

  @ApiProperty({ minLength: 3 })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ description: '-1 = ilimitado' })
  @IsInt()
  servicesPerMonth!: number;

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  coverageLimit!: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  features!: string[];

  @ApiPropertyOptional({ default: 'brand' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  popular?: boolean;

  @ApiPropertyOptional({ enum: BillingCycle, default: BillingCycle.monthly })
  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;
}
