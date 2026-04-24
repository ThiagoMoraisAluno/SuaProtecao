import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { SessionRequest } from "./SessionRequest";
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { AuthTokens } from "../auth.service";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { v4 as uuidv4 } from 'uuid';
import { SessionResponse } from "./SessionResponse";

@Injectable()
export class SessionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async execute({ email, password }: SessionRequest){
        const user = await this.prisma.user.findUnique({
            where: { email: email },
            include: { profile: true },
        });

        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas.');
        }

        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValid) {
            throw new UnauthorizedException('Credenciais inválidas.');
        }

        const tokens = await this.generateAndStoreTokens(user.id, user.email, user.role);

        return {
            tokens,
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