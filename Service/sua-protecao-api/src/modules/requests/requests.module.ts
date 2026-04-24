import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { RequestsRepository } from './requests.repository';
import { REQUESTS_REPOSITORY_TOKEN } from './interfaces/requests-repository.interface';

@Module({
  imports: [PrismaModule],
  controllers: [RequestsController],
  providers: [
    RequestsService,
    { provide: REQUESTS_REPOSITORY_TOKEN, useClass: RequestsRepository },
  ],
  exports: [RequestsService],
})
export class RequestsModule {}
