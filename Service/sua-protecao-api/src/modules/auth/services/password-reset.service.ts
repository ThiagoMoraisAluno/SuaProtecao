import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { addMinutes } from 'date-fns';
import { BCRYPT_ROUNDS, PASSWORD_RESET_TTL_MINUTES } from '../../../common/constants/security.constants';
import { IPasswordResetService } from '../interfaces/password-reset-service.interface';
import {
  IAuthRepository,
  AUTH_REPOSITORY_TOKEN,
} from '../interfaces/auth-repository.interface';
import {
  ITokenService,
  TOKEN_SERVICE_TOKEN,
} from '../interfaces/token-service.interface';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class PasswordResetService implements IPasswordResetService {
  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
    @Inject(TOKEN_SERVICE_TOKEN)
    private readonly tokenService: ITokenService,
    private readonly mailService: MailService,
  ) {}

  async initiateReset(email: string): Promise<{ message: string }> {
    const successMessage = {
      message: 'Se o e-mail existir, você receberá as instruções.',
    };

    const user = await this.authRepository.findUserByEmail(email);
    if (!user) return successMessage;

    const plainToken = this.tokenService.generateResetToken();
    const tokenHash = this.tokenService.hashToken(plainToken);
    const expiresAt = addMinutes(new Date(), PASSWORD_RESET_TTL_MINUTES);

    await this.authRepository.createPasswordResetToken(
      user.id,
      tokenHash,
      expiresAt,
    );

    await this.mailService.sendPasswordResetEmail(email, plainToken);

    return successMessage;
  }

  async completeReset(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const tokenHash = this.tokenService.hashToken(token);
    const record = await this.authRepository.findPasswordResetToken(tokenHash);

    if (!record) {
      throw new BadRequestException('Token inválido ou expirado.');
    }
    if (record.usedAt !== null) {
      throw new BadRequestException('Token já utilizado.');
    }
    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Token expirado.');
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await this.authRepository.markPasswordResetTokenUsed(record.id);
    await this.authRepository.updatePassword(record.userId, passwordHash);

    return { message: 'Senha redefinida com sucesso.' };
  }
}
