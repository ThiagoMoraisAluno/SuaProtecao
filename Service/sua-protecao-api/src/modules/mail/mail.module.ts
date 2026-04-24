import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isDev = config.get<string>('NODE_ENV') !== 'production';

        return {
          transport: isDev
            ? {
                // Dev: porta 1025 é padrão do MailHog/Mailpit — sem autenticação
                host: config.get<string>('SMTP_HOST') ?? 'localhost',
                port: config.get<number>('SMTP_PORT') ?? 1025,
                ignoreTLS: true,
              }
            : {
                host: config.get<string>('SMTP_HOST'),
                port: config.get<number>('SMTP_PORT') ?? 587,
                secure: config.get<string>('SMTP_SECURE') === 'true',
                auth: {
                  user: config.get<string>('SMTP_USER'),
                  pass: config.get<string>('SMTP_PASS'),
                },
              },
          defaults: {
            from:
              config.get<string>('SMTP_FROM') ??
              '"Sua Proteção" <noreply@suaprotecao.com.br>',
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
