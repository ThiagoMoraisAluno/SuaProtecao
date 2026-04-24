import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SupervisorsModule } from './modules/supervisors/supervisors.module';
import { ClientsModule } from './modules/clients/clients.module';
import { PlansModule } from './modules/plans/plans.module';
import { RequestsModule } from './modules/requests/requests.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // H1: rate limiting global + throttlers nomeados aplicados nos controllers
    ThrottlerModule.forRoot([
      { name: 'global', ttl: 60000, limit: 100 },
      // login: 5 tentativas/min por IP
      { name: 'login', ttl: 60000, limit: 5 },
      // strict: 3 req/min por IP — registro e reset de senha
      { name: 'strict', ttl: 60000, limit: 3 },
    ]),

    PrismaModule,
    AuthModule,
    UsersModule,
    SupervisorsModule,
    ClientsModule,
    PlansModule,
    RequestsModule,
    DashboardModule,
  ],
  providers: [
    // Aplica ThrottlerGuard globalmente em todos os endpoints
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
