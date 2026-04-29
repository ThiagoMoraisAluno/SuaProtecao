import { IsInt, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetPlanRuleDto {
  @ApiProperty({ description: '-1 = ilimitado' })
  @IsInt()
  maxPerMonth!: number;

  @ApiProperty({ description: '-1 = ilimitado' })
  @IsInt()
  maxPerYear!: number;

  @ApiProperty({ minimum: 0, description: 'Limite por chamado em R$' })
  @IsNumber()
  @Min(0)
  coverageLimit!: number;
}
