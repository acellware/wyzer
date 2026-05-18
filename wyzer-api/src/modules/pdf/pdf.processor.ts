import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PdfService, PDF_QUEUE, PdfJobPayload } from './pdf.service';
import { StorageService } from '../../common/storage/storage.service';
import { ReportsRepository } from '../reports/reports.repository';

@Processor(PDF_QUEUE)
export class PdfProcessor extends WorkerHost {
  private readonly logger = new Logger(PdfProcessor.name);

  constructor(
    private readonly pdfService: PdfService,
    private readonly storageService: StorageService,
    private readonly reportsRepo: ReportsRepository,
  ) {
    super();
  }

  async process(job: Job<PdfJobPayload>): Promise<void> {
    const { reportId, reportUrl } = job.data;
    this.logger.log(`Starting PDF generation for report ${reportId}`);

    try {
      const pdfBuffer = await this.pdfService.renderToPdf(reportUrl);

      const key = `reports/${reportId}/report.pdf`;
      const pdfUrl = await this.storageService.upload(key, pdfBuffer, 'application/pdf');

      await this.reportsRepo.setPdfUrl(reportId, pdfUrl);
      this.logger.log(`PDF generated and stored: ${pdfUrl}`);
    } catch (err) {
      this.logger.error(`PDF generation failed for report ${reportId}: ${(err as Error).message}`);
      throw err; // BullMQ will retry
    }
  }
}
