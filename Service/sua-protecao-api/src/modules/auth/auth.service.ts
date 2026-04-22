import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthResponse, AuthTokens, AuthUser } from './interfaces/auth-response.interface';
import { UserRole } from '@prisma/client';

export { AuthResponse, AuthTokens, AuthUser };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const tokens = await this.generateAndStoreTokens(user.id, user.email, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.profile?.username ?? '',
        email: user.email,
        role: user.role,
        phone: user.profile?.phone ?? null,
      },
    };
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('E-mail já cadastrado.');
    }

    const existingCpf = await this.prisma.client.findUnique({
      where: { cpf: dto.cpf },
    });
    if (existingCpf) {
      throw new ConflictException('CPF já cadastrado.');
    }

    const plan = await this.prisma.plan.findUnique({
      where: { id: dto.planId },
    });
    if (!plan) {
      throw new NotFoundException('Plano não encontrado.');
    }

    const rounds = this.configService.get<number>('BCRYPT_ROUNDS') ?? 12;
    const passwordHash = await bcrypt.hash(dto.password, rounds);

    const totalAssetsValue = dto.assets.reduce(
      (sum, asset) => sum + asset.estimatedValue,
      0,
    );

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          role: 'client',
          profile: {
            create: {
              username: dto.name,
              phone: dto.phone,
            },
          },
          client: {
            create: {
              cpf: dto.cpf,
              phone: dto.phone,
              planId: dto.planId,
              totalAssetsValue,
              addressStreet: dto.addressStreet,
              addressNumber: dto.addressNumber,
              addressComplement: dto.addressComplement,
              addressNeighborhood: dto.addressNeighborhood,
              addressCity: dto.addressCity,
              addressState: dto.addressState,
              addressZipCode: dto.addressZipCode,
              assets: {
                create: dto.assets.map((a) => ({
                  name: a.name,
                  estimatedValue: a.estimatedValue,
                })),
              },
            },
          },
        },
        include: { profile: true },
      });
      return newUser;
    });

    const tokens = await this.generateAndStoreTokens(user.id, user.email, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.profile?.username ?? '',
        email: user.email,
        role: user.role,
        phone: user.profile?.phone ?? null,
      },
    };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido ou expirado.');
    }

    // Rotate: delete old, issue new
    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    return this.generateAndStoreTokens(
      stored.user.id,
      stored.user.email,
      stored.user.role,
    );
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Always respond with success to avoid user enumeration
    if (!user) {
      return { message: 'Se o e-mail existir, você receberá as instruções.' };
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'password-reset' },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      },
    );

    const appUrl = this.configService.get<string>('APP_URL') ?? 'http://localhost:5173';
    const resetLink = `${appUrl}/reset-password?token=${resetToken}`;

    // TODO: send email via MailerService — configure SMTP in .env
    // For now, log to console in development
    if (this.configService.get<string>('NODE_ENV') !== 'production') {
      console.log(`[DEV] Password reset link: ${resetLink}`);
    }

    return { message: 'Se o e-mail existir, você receberá as instruções.' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    let payload: { sub: string; type: string };
    try {
      payload = this.jwtService.verify<{ sub: string; type: string }>(
        dto.token,
        { secret: this.configService.get<string>('JWT_SECRET') },
      );
    } catch {
      throw new BadRequestException('Token inválido ou expirado.');
    }

    if (payload.type !== 'password-reset') {
      throw new BadRequestException('Token inválido.');
    }

    const rounds = this.configService.get<number>('BCRYPT_ROUNDS') ?? 12;
    const passwordHash = await bcrypt.hash(dto.password, rounds);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: payload.sub },
        data: { passwordHash },
      }),
      this.prisma.refreshToken.deleteMany({ where: { userId: payload.sub } }),
    ]);

    return { message: 'Senha redefinida com sucesso.' };
  }

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return {
      id: user.id,
      name: user.profile?.username ?? '',
      email: user.email,
      role: user.role,
      phone: user.profile?.phone ?? null,
    };
  }

  private async generateAndStoreTokens(
    userId: string,
    email: string,
    role: UserRole,
  ): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') ?? '15m',
    });

    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }
}
