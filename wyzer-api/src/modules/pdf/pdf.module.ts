import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PdfService, PDF_QUEUE } from './pdf.service';
import { PdfProcessor } from './pdf.processor';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: PDF_QUEUE }),
    ReportsModule,
  ],
  providers: [PdfService, PdfProcessor],
  exports: [PdfService],
})
export class PdfModule {}
