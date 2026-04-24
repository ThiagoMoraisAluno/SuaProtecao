import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  BCRYPT_ROUNDS,
  TIMING_SAFE_DUMMY_HASH,
} from '../../common/constants/security.constants';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto, AuthTokensDto, AuthUserDto } from './dto/auth-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import {
  IAuthRepository,
  AUTH_REPOSITORY_TOKEN,
  UserWithProfile,
} from './interfaces/auth-repository.interface';
import {
  ITokenService,
  TOKEN_SERVICE_TOKEN,
} from './interfaces/token-service.interface';
import {
  ISessionService,
  SESSION_SERVICE_TOKEN,
} from './interfaces/session-service.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
    @Inject(TOKEN_SERVICE_TOKEN)
    private readonly tokenService: ITokenService,
    @Inject(SESSION_SERVICE_TOKEN)
    private readonly sessionService: ISessionService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // P1: busca sem profile — valida senha antes do join
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user) {
      // Equaliza o tempo de resposta para prevenir enumeração de usuários por timing
      await bcrypt.compare(dto.password, TIMING_SAFE_DUMMY_HASH);
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) throw new UnauthorizedException('Credenciais inválidas.');

    // Busca profile apenas após autenticar
    const fullUser = await this.authRepository.findUserWithProfileById(user.id);

    const tokens = await this.issueTokens(user.id, user.email, user.role);

    return { ...tokens, user: this.toAuthUser(fullUser!) };
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const plan = await this.authRepository.findPlanById(dto.planId);
    if (!plan) throw new NotFoundException('Plano não encontrado.');

    const totalAssetsValue = dto.assets.reduce(
      (sum, asset) => sum + asset.estimatedValue,
      0,
    );

    // P2: deixa o banco rejeitar duplicatas via unique constraint
    let user: UserWithProfile;
    try {
      user = await this.authRepository.createClientUser({
        dto,
        passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
        totalAssetsValue,
      });
    } catch (error) {
      const e = error as { code?: string };
      if (e.code === 'P2002') {
        throw new ConflictException('E-mail ou CPF já cadastrado.');
      }
      throw error;
    }

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    return { ...tokens, user: this.toAuthUser(user) };
  }

  async refresh(refreshToken: string): Promise<AuthTokensDto> {
    const result = await this.sessionService.rotateToken(refreshToken);
    if (!result) {
      throw new UnauthorizedException('Refresh token inválido ou expirado.');
    }

    return this.issueTokens(
      result.user.id,
      result.user.email,
      result.user.role,
    );
  }

  // S7: logout seletivo — invalida apenas a sessão atual
  async logout(refreshToken: string): Promise<void> {
    await this.sessionService.invalidate(refreshToken);
  }

  // S7: logout global — invalida todas as sessões do usuário
  async logoutAll(userId: string): Promise<void> {
    await this.sessionService.invalidateAll(userId);
  }

  async getMe(userId: string): Promise<AuthUserDto> {
    const user = await this.authRepository.findUserWithProfileById(userId);
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return this.toAuthUser(user);
  }

  private async issueTokens(
    userId: string,
    email: string,
    role: JwtPayload['role'],
  ): Promise<AuthTokensDto> {
    const payload: JwtPayload = { sub: userId, email, role };
    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken();
    await this.sessionService.create(userId, refreshToken);
    return { accessToken, refreshToken };
  }

  private toAuthUser(user: UserWithProfile): AuthUserDto {
    return {
      id: user.id,
      name: user.profile?.username ?? '',
      email: user.email,
      role: user.role,
      phone: user.profile?.phone ?? null,
    };
  }
}
