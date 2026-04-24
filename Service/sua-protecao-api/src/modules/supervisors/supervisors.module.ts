import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SupervisorsController } from './supervisors.controller';
import { SupervisorsService } from './supervisors.service';
import { SupervisorsRepository } from './supervisors.repository';
import { SUPERVISORS_REPOSITORY_TOKEN } from './interfaces/supervisors-repository.interface';

@Module({
  imports: [PrismaModule],
  controllers: [SupervisorsController],
  providers: [
    SupervisorsService,
    { provide: SUPERVISORS_REPOSITORY_TOKEN, useClass: SupervisorsRepository },
  ],
  exports: [SupervisorsService],
})
export class SupervisorsModule {}
