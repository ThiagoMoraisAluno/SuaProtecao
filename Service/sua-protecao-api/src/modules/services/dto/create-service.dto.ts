import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ minLength: 2 })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({
    description: 'Identificador único, minúsculas, sem espaços (ex: "ar-condicionado")',
    pattern: '^[a-z0-9_-]+$',
  })
  @IsString()
  @Matches(/^[a-z0-9_-]+$/, {
    message:
      'slug deve conter apenas letras minúsculas, números, hífen e underline.',
  })
  slug!: string;

  @ApiPropertyOptional({ description: 'Emoji ou nome de ícone' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
