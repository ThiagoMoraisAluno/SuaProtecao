import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SessionRequest {
    @ApiProperty({ example: 'admin@demo.com' })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: '123456' })
    @IsString()
    @MinLength(6)
    password!: string;
}