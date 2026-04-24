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

    // H1: rate limiting global (100 req/min) + named "login" (5/min — aplicado no controller)
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'login',
        ttl: 60000,
        limit: 5,
      },
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
