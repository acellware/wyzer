import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ReportsController } from './reports.controller';
import { ReportsService, REPORT_QUEUE } from './reports.service';
import { ReportsRepository } from './reports.repository';
import { ReportProcessor } from './report.processor';
import { ComplianceModule } from '../compliance/compliance.module';
import { StacksModule } from '../stacks/stacks.module';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { PDF_QUEUE } from '../pdf/pdf.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: REPORT_QUEUE }),
    BullModule.registerQueue({ name: PDF_QUEUE }),
    PrismaModule,
    ComplianceModule,
    StacksModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsRepository, ReportProcessor],
  exports: [ReportsRepository],
})
export class ReportsModule {}


