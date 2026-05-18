import { Module } from '@nestjs/common';
import { StackTemplatesController } from './stack-templates.controller';
import { StackTemplatesService } from './stack-templates.service';
import { StackTemplatesRepository } from './stack-templates.repository';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StackTemplatesController],
  providers: [StackTemplatesService, StackTemplatesRepository],
  exports: [StackTemplatesService],
})
export class StackTemplatesModule {}
