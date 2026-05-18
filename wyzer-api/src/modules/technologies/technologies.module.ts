import { Module } from '@nestjs/common';
import { TechnologiesController } from './technologies.controller';
import { TechnologiesService } from './technologies.service';
import { TechnologiesRepository } from './technologies.repository';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TechnologiesController],
  providers: [TechnologiesService, TechnologiesRepository],
  exports: [TechnologiesService],
})
export class TechnologiesModule {}
