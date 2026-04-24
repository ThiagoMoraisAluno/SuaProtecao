import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { USERS_REPOSITORY_TOKEN } from './interfaces/users-repository.interface';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    { provide: USERS_REPOSITORY_TOKEN, useClass: UsersRepository },
  ],
  exports: [UsersService],
})
export class UsersModule {}
