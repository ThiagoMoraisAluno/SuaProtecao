import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import {
  IPasswordResetService,
  PASSWORD_RESET_SERVICE_TOKEN,
} from './interfaces/password-reset-service.interface';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Cookie } from '../../common/decorators/cookie.decorator';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import {
  AuthPublicResponseDto,
  AuthPublicTokenDto,
} from './dto/auth-response.dto';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;          // 15 min
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(PASSWORD_RESET_SERVICE_TOKEN)
    private readonly passwordResetService: IPasswordResetService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ login: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Login com e-mail e senha' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthPublicResponseDto> {
    const { refreshToken, ...publicResult } = await this.authService.login(dto);
    this.setAuthCookies(res, publicResult.accessToken, refreshToken);
    return publicResult;
  }

  @Post('register')
  @Throttle({ strict: { ttl: 60000, limit: 3 } })
  @ApiOperation({ summary: 'Registro de novo cliente (self-service)' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthPublicResponseDto> {
    const { refreshToken, ...publicResult } = await this.authService.register(dto);
    this.setAuthCookies(res, publicResult.accessToken, refreshToken);
    return publicResult;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ strict: { ttl: 60000, limit: 3 } })
  @ApiOperation({ summary: 'Solicita redefinição de senha' })
  forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.passwordResetService.initiateReset(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ strict: { ttl: 60000, limit: 3 } })
  @ApiOperation({ summary: 'Redefine senha via token (invalida o token após uso)' })
  resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.passwordResetService.completeReset(dto.token, dto.password);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotaciona tokens usando o refresh token em cookie' })
  async refresh(
    @Cookie(REFRESH_TOKEN_COOKIE) refreshToken: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthPublicTokenDto> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token não encontrado.');
    }
    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refresh(refreshToken);
    this.setAuthCookies(res, accessToken, newRefreshToken);
    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalida a sessão atual (cookie refresh_token)' })
  async logout(
    @Cookie(REFRESH_TOKEN_COOKIE) refreshToken: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    this.clearAuthCookies(res);
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalida todas as sessões do usuário em todos os dispositivos' })
  async logoutAll(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    this.clearAuthCookies(res);
    await this.authService.logoutAll(user.sub);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna dados do usuário autenticado' })
  getMe(@CurrentUser() user: JwtPayload) {
    return this.authService.getMe(user.sub);
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    });

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
      path: '/auth', // restringe o cookie apenas às rotas /auth
    });
  }

  private clearAuthCookies(res: Response): void {
    res.clearCookie(ACCESS_TOKEN_COOKIE);
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/auth' });
  }
}
