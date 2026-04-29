import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { ServicesRepository } from './services.repository';
import { SERVICES_REPOSITORY_TOKEN } from './interfaces/services-repository.interface';

@Module({
  imports: [PrismaModule],
  controllers: [ServicesController],
  providers: [
    ServicesService,
    { provide: SERVICES_REPOSITORY_TOKEN, useClass: ServicesRepository },
  ],
  exports: [ServicesService],
})
export class ServicesModule {}
