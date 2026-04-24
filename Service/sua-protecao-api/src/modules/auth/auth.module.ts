import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { TokenService } from './services/token.service';
import { SessionService } from './services/session.service';
import { PasswordResetService } from './services/password-reset.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AUTH_REPOSITORY_TOKEN } from './interfaces/auth-repository.interface';
import { TOKEN_SERVICE_TOKEN } from './interfaces/token-service.interface';
import { SESSION_SERVICE_TOKEN } from './interfaces/session-service.interface';
import { PASSWORD_RESET_SERVICE_TOKEN } from './interfaces/password-reset-service.interface';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') ?? '15m',
          algorithm: 'HS256',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: AUTH_REPOSITORY_TOKEN, useClass: AuthRepository },
    { provide: TOKEN_SERVICE_TOKEN, useClass: TokenService },
    { provide: SESSION_SERVICE_TOKEN, useClass: SessionService },
    { provide: PASSWORD_RESET_SERVICE_TOKEN, useClass: PasswordResetService },
    JwtStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
