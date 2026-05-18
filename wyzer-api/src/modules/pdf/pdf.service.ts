import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer from 'puppeteer';
import type { Env } from '../../config/env.schema';

export const PDF_QUEUE = 'pdf-generation';

export interface PdfJobPayload {
  reportId: string;
  reportUrl: string;
}

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(private readonly config: ConfigService<Env, true>) {}

  /**
   * Launches Puppeteer, navigates to the report URL, and returns the PDF as a Buffer.
   */
  async renderToPdf(url: string): Promise<Buffer> {
    this.logger.log(`Launching Puppeteer for ${url}`);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 900, deviceScaleFactor: 1.5 });

      // Wait for network idle to ensure all fonts/styles are loaded
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '24px', right: '24px', bottom: '24px', left: '24px' },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }
}
