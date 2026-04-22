import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupervisorDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Porcentagem de comissão, ex: 10 = 10%' })
  @IsNumber()
  @Min(0)
  @Max(100)
  commission!: number;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password!: string;
}
