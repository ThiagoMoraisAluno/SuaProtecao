import {
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
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

export class CreateClientDto {
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

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty()
  @IsUUID()
  planId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  supervisorId?: string;

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

  @ApiProperty({ type: [ClientAssetDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClientAssetDto)
  assets!: ClientAssetDto[];
}
