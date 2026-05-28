import { Module } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { FrameworksController } from './frameworks.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
 imports: [PrismaModule],
 controllers: [FrameworksController],
 providers: [ComplianceService],
 exports: [ComplianceService],
})
export class ComplianceModule {}
