import { Module } from '@nestjs/common';
import { StacksController } from './stacks.controller';
import { StacksService } from './stacks.service';
import { StacksRepository } from './stacks.repository';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StacksController],
  providers: [StacksService, StacksRepository],
  exports: [StacksService],
})
export class StacksModule {}
