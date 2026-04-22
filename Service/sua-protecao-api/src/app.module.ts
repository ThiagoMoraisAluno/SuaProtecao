import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SupervisorsModule,
    ClientsModule,
    PlansModule,
    RequestsModule,
    DashboardModule,
  ],
})
export class AppModule {}
