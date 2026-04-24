import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { ClientsRepository } from './clients.repository';
import { CLIENTS_REPOSITORY_TOKEN } from './interfaces/clients-repository.interface';

@Module({
  imports: [PrismaModule],
  controllers: [ClientsController],
  providers: [
    ClientsService,
    { provide: CLIENTS_REPOSITORY_TOKEN, useClass: ClientsRepository },
  ],
  exports: [ClientsService],
})
export class ClientsModule {}
