import {
 ForbiddenException,
 Injectable,
 NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { randomBytes } from 'crypto';
import { ReportsRepository } from './reports.repository';
import { CreateReportDto } from './dto/create-report.dto';
import { StacksService } from '../stacks/stacks.service';
import { PdfService, PDF_QUEUE, PdfJobPayload } from '../pdf/pdf.service';
import { StorageService } from '../../common/storage/storage.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../config/env.schema';

export const REPORT_QUEUE = 'compliance-report';

/** How long a cached DONE report is considered fresh (returned instead of re-running). */
const REPORT_CACHE_TTL_MS = 12 * 60 * 60 * 1000;

export interface ReportJobPayload {
 reportId: string;
 stackId: string;
 frameworkIds: string[];
}

@Injectable()
export class ReportsService {
 constructor(
  private readonly repo: ReportsRepository,
  private readonly stacksService: StacksService,
  @InjectQueue(REPORT_QUEUE) private readonly queue: Queue<ReportJobPayload>,
  @InjectQueue(PDF_QUEUE) private readonly pdfQueue: Queue<PdfJobPayload>,
  private readonly storageService: StorageService,
  private readonly auditLog: AuditLogService,
  private readonly config: ConfigService<Env, true>,
 ) {}

 async create(organisationId: string, dto: CreateReportDto, userId?: string) {
  // Verify the stack belongs to the caller's org
  await this.stacksService.findOne(dto.stackId, organisationId);

  // Cache hit: return a recent DONE report for the same stack instead of re-running.
  // Stacks are conceptually immutable (edits clone to a new stack), so a fresh
  // report for the same stackId is always valid.
  const since = new Date(Date.now() - REPORT_CACHE_TTL_MS);
  const cached = await this.repo.findFreshReport(dto.stackId, since);
  if (cached) return cached;

  // If no frameworkIds provided, run against all known frameworks
  let frameworkIds = dto.frameworkIds ?? [];
  if (frameworkIds.length === 0) {
   const allFrameworks = await this.repo.findAllFrameworks();
   frameworkIds = allFrameworks.map((f) => f.id);
  }

  const report = await this.repo.create(dto.stackId);

  await this.queue.add('assess', {
   reportId: report.id,
   stackId: dto.stackId,
   frameworkIds,
  });

  await this.auditLog.record({
   organisationId,
   userId,
   action: 'report.generated',
   resourceType: 'report',
   resourceId: report.id,
   metadata: { stackId: dto.stackId, frameworkIds: dto.frameworkIds },
  });

  return report;
 }

 async findAll(
  organisationId: string,
  opts: { take?: number; cursor?: string } = {},
 ) {
  const take = Math.min(Math.max(opts.take ?? 25, 1), 100);
  return this.repo.findAll(organisationId, { take, cursor: opts.cursor });
 }

 async findOne(id: string, organisationId: string) {
  const report = await this.repo.findOne(id, organisationId);
  if (!report) throw new NotFoundException(`Report '${id}' not found`);
  return report;
 }

 /**
  * T-040: Trigger PDF generation for an existing report.
  * Enqueues a BullMQ job; the job renders the report page with Puppeteer,
  * uploads the PDF to Cloudflare R2, and stores the pdfUrl on the report.
  * Requires PRO or TEAM plan (enforced by PlanGuard on the route).
  */
 async requestPdf(
  id: string,
  organisationId: string,
 ): Promise<{ jobId: string | undefined }> {
  const report = await this.findOne(id, organisationId);

  if (!this.storageService.isConfigured()) {
   throw new ForbiddenException(
    'PDF export requires R2 storage to be configured',
   );
  }

  const appUrl = this.config.get('APP_URL', { infer: true });
  const reportUrl = `${appUrl}/reports/${report.id}`;

  const job = await this.pdfQueue.add('generate', {
   reportId: report.id,
   reportUrl,
  });

  return { jobId: job.id };
 }

 /**
  * T-041: Generate a share token for a report and return the share URL.
  * The token is a 32-byte random hex string; expires in 30 days.
  */
 async createShareToken(
  id: string,
  organisationId: string,
 ): Promise<{ shareUrl: string; expiresAt: Date }> {
  await this.findOne(id, organisationId);

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await this.repo.setShareToken(id, token, expiresAt);

  const appUrl = this.config.get('APP_URL', { infer: true });
  return { shareUrl: `${appUrl}/share/${token}`, expiresAt };
 }

 /**
  * T-041: Fetch a shared report by its public share token (no auth).
  * Returns the report if the token is valid and not expired.
  */
 async findByShareToken(token: string) {
  const report = await this.repo.findByShareToken(token);
  if (!report)
   throw new NotFoundException('Share link is invalid or has expired');
  // Enrich with frameworks so the unauthenticated share page can show
  // human-readable framework names instead of opaque IDs.
  const frameworks = await this.repo.findAllFrameworks();
  return { ...report, frameworks };
 }
}
