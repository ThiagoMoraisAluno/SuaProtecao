import { Inject, Injectable } from '@nestjs/common';
import { addDays } from 'date-fns';
import { REFRESH_TOKEN_TTL_DAYS } from '../../../common/constants/security.constants';
import {
  ISessionService,
  SessionUser,
} from '../interfaces/session-service.interface';
import {
  IAuthRepository,
  AUTH_REPOSITORY_TOKEN,
} from '../interfaces/auth-repository.interface';
import {
  ITokenService,
  TOKEN_SERVICE_TOKEN,
} from '../interfaces/token-service.interface';

@Injectable()
export class SessionService implements ISessionService {
  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
    @Inject(TOKEN_SERVICE_TOKEN)
    private readonly tokenService: ITokenService,
  ) {}

  async create(userId: string, plainToken: string): Promise<void> {
    const tokenHash = this.tokenService.hashToken(plainToken);
    const expiresAt = addDays(new Date(), REFRESH_TOKEN_TTL_DAYS);
    await this.authRepository.storeRefreshToken(userId, tokenHash, expiresAt);
  }

  async rotateToken(
    plainToken: string,
  ): Promise<{ user: SessionUser } | null> {
    const tokenHash = this.tokenService.hashToken(plainToken);
    const stored = await this.authRepository.findRefreshToken(tokenHash);

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await this.authRepository.deleteRefreshToken(stored.id);
      return null;
    }

    await this.authRepository.deleteRefreshToken(stored.id);

    return { user: stored.user };
  }

  async invalidate(plainToken: string): Promise<void> {
    const tokenHash = this.tokenService.hashToken(plainToken);
    const stored = await this.authRepository.findRefreshToken(tokenHash);
    if (stored) {
      await this.authRepository.deleteRefreshToken(stored.id);
    }
  }

  async invalidateAll(userId: string): Promise<void> {
    await this.authRepository.deleteAllRefreshTokens(userId);
  }
}
