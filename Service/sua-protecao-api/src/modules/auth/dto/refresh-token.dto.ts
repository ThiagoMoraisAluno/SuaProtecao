import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Body opcional para /auth/refresh e /auth/logout.
 * O refreshToken vem prioritariamente do cookie (HttpOnly, same-origin), mas
 * consumidores BFF em domínio separado podem enviar no body.
 */
export class RefreshTokenDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
