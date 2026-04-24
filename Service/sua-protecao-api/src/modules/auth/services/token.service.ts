import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { ITokenService } from '../interfaces/token-service.interface';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class TokenService implements ITokenService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly resetSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret = this.requireEnv('JWT_SECRET');
    this.jwtExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN') ?? '15m';
    this.resetSecret = this.requireEnv('PASSWORD_RESET_SECRET');
  }

  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: this.jwtExpiresIn,
      algorithm: 'HS256',
    });
  }

  generateRefreshToken(): string {
    return uuidv4();
  }

  generateResetToken(): string {
    return uuidv4();
  }

  verifyResetToken(token: string): { sub: string } {
    return this.jwtService.verify<{ sub: string }>(token, {
      secret: this.resetSecret,
    });
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private requireEnv(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) throw new Error(`${key} não configurado`);
    return value;
  }
}
