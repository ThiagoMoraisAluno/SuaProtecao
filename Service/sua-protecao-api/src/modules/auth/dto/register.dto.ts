import {
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClientAssetDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  estimatedValue!: number;
}

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/;
const PASSWORD_MESSAGE =
  'Senha deve conter maiúscula, minúscula, número e símbolo (@$!%*?&#)';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  cpf!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @MaxLength(128, { message: 'Senha deve ter no máximo 128 caracteres' })
  @Matches(PASSWORD_PATTERN, { message: PASSWORD_MESSAGE })
  password!: string;

  @ApiProperty()
  @IsString()
  addressStreet!: string;

  @ApiProperty()
  @IsString()
  addressNumber!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressComplement?: string;

  @ApiProperty()
  @IsString()
  addressNeighborhood!: string;

  @ApiProperty()
  @IsString()
  addressCity!: string;

  @ApiProperty()
  @IsString()
  @Length(2, 2)
  addressState!: string;

  @ApiProperty()
  @IsString()
  addressZipCode!: string;

  @ApiProperty()
  @IsString()
  planId!: string;

  @ApiProperty({ type: [ClientAssetDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClientAssetDto)
  assets!: ClientAssetDto[];
}
