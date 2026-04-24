import { JwtPayload } from './jwt-payload.interface';

export interface ITokenService {
  generateAccessToken(payload: JwtPayload): string;
  generateRefreshToken(): string;
  generateResetToken(): string;
  verifyResetToken(token: string): { sub: string };
  hashToken(token: string): string;
}

export const TOKEN_SERVICE_TOKEN = 'TOKEN_SERVICE';
