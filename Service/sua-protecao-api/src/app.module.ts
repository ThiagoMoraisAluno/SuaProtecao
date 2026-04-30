import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SupervisorsModule } from './modules/supervisors/supervisors.module';
import { ClientsModule } from './modules/clients/clients.module';
import { PlansModule } from './modules/plans/plans.module';
import { ServicesModule } from './modules/services/services.module';
import { RequestsModule } from './modules/requests/requests.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BillingModule } from './modules/billing/billing.module';
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ScheduleModule.forRoot(),

    ThrottlerModule.forRoot([
      { name: 'global', ttl: 60000, limit: 100 },
      { name: 'login', ttl: 60000, limit: 5 },
      { name: 'strict', ttl: 60000, limit: 3 },
    ]),

    PrismaModule,
    AuthModule,
    UsersModule,
    SupervisorsModule,
    ClientsModule,
    PlansModule,
    ServicesModule,
    RequestsModule,
    DashboardModule,
    NotificationsModule,
    PaymentsModule,
    BillingModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
