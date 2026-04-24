import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly appUrl: string;
  private readonly isDev: boolean;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.appUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';
    this.isDev = this.configService.get<string>('NODE_ENV') !== 'production';
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.appUrl}/reset-password?token=${resetToken}`;

    if (this.isDev) {
      this.logger.log(`[DEV] Password reset link for ${to}: ${resetUrl}`);
    }

    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Redefinição de senha — Sua Proteção',
        html: this.buildPasswordResetHtml(resetUrl),
        text: `Acesse o link para redefinir sua senha (expira em 30 min): ${resetUrl}`,
      });
    } catch (error) {
      // Em dev sem MailHog rodando, apenas loga — não falha o fluxo
      if (this.isDev) {
        this.logger.warn(`[DEV] E-mail não enviado (SMTP indisponível): ${String(error)}`);
        return;
      }
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    if (this.isDev) {
      this.logger.log(`[DEV] Welcome email to ${name} <${to}>`);
    }

    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Bem-vindo à Sua Proteção!',
        html: this.buildWelcomeHtml(name),
        text: `Olá, ${name}! Seu cadastro na Sua Proteção foi realizado com sucesso.`,
      });
    } catch (error) {
      if (this.isDev) {
        this.logger.warn(`[DEV] E-mail não enviado: ${String(error)}`);
        return;
      }
      throw error;
    }
  }

  private buildPasswordResetHtml(resetUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.1);">
    <div style="background: #1a56db; padding: 24px 32px;">
      <h1 style="color: #fff; margin: 0; font-size: 22px;">Sua Proteção</h1>
    </div>
    <div style="padding: 32px;">
      <h2 style="color: #111; margin-top: 0;">Redefinição de senha</h2>
      <p style="color: #444; line-height: 1.6;">
        Recebemos uma solicitação para redefinir a senha da sua conta.
        Clique no botão abaixo para criar uma nova senha.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}"
           style="background: #1a56db; color: #fff; padding: 14px 28px; border-radius: 6px;
                  text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
          Redefinir senha
        </a>
      </div>
      <p style="color: #888; font-size: 13px; line-height: 1.6;">
        Este link expira em <strong>30 minutos</strong>.<br>
        Se você não solicitou a redefinição, ignore este e-mail — sua senha não será alterada.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
      <p style="color: #aaa; font-size: 12px;">
        Caso o botão não funcione, copie e cole este link no seu navegador:<br>
        <a href="${resetUrl}" style="color: #1a56db; word-break: break-all;">${resetUrl}</a>
      </p>
    </div>
  </div>
</body>
</html>`;
  }

  private buildWelcomeHtml(name: string): string {
    const loginUrl = `${this.appUrl}/login`;
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.1);">
    <div style="background: #1a56db; padding: 24px 32px;">
      <h1 style="color: #fff; margin: 0; font-size: 22px;">Sua Proteção</h1>
    </div>
    <div style="padding: 32px;">
      <h2 style="color: #111; margin-top: 0;">Bem-vindo, ${name}! 🎉</h2>
      <p style="color: #444; line-height: 1.6;">
        Seu cadastro foi realizado com sucesso. Agora você pode acessar o painel
        e gerenciar sua proteção residencial.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${loginUrl}"
           style="background: #1a56db; color: #fff; padding: 14px 28px; border-radius: 6px;
                  text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
          Acessar minha conta
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;
  }
}
