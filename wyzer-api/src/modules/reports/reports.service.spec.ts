import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { mock } from 'jest-mock-extended';
import type { Queue } from 'bullmq';
import { ReportsRepository } from './reports.repository';
import { StacksService } from '../stacks/stacks.service';
import { StorageService } from '@common/storage/storage.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { ConfigService } from '@nestjs/config';
import { ReportsService } from './reports.service';

// Avoid pulling in puppeteer (ESM) from pdf.service at import time
jest.mock('../pdf/pdf.service', () => ({
  PDF_QUEUE: 'pdf-generation',
  PdfService: class {},
}));

// ─── Fixtures ────────────────────────────────────────────────────────────────

const ORG_ID = 'org-1';
const USER_ID = 'user-1';
const REPORT_ID = 'report-1';
const STACK_ID = 'stack-1';

function makeReport(overrides = {}) {
  return {
    id: REPORT_ID,
    stackId: STACK_ID,
    status: 'PENDING',
    pdfUrl: null,
    shareToken: null,
    shareExpiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ReportsService', () => {
  let service: ReportsService;
  let repo: ReturnType<typeof mock<ReportsRepository>>;
  let stacksService: ReturnType<typeof mock<StacksService>>;
  let queue: ReturnType<typeof mock<Queue>>;
  let pdfQueue: ReturnType<typeof mock<Queue>>;
  let storageService: ReturnType<typeof mock<StorageService>>;
  let auditLog: ReturnType<typeof mock<AuditLogService>>;
  let config: ReturnType<typeof mock<ConfigService>>;

  beforeEach(() => {
    repo = mock<ReportsRepository>();
    stacksService = mock<StacksService>();
    queue = mock<Queue>();
    pdfQueue = mock<Queue>();
    storageService = mock<StorageService>();
    auditLog = mock<AuditLogService>();
    config = mock<ConfigService>();

    auditLog.record.mockResolvedValue(undefined as never);
    config.get.mockReturnValue('http://localhost:3000' as never);

    service = new ReportsService(
      repo,
      stacksService,
      queue as never,
      pdfQueue as never,
      storageService,
      auditLog,
      config as never,
    );
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('throws NotFoundException when stack does not belong to org', async () => {
      stacksService.findOne.mockRejectedValue(new NotFoundException('Stack not found'));

      await expect(
        service.create(ORG_ID, { stackId: STACK_ID, frameworkIds: ['fw-1'] }, USER_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('creates report, enqueues assess job, and records audit log', async () => {
      stacksService.findOne.mockResolvedValue({ id: STACK_ID } as never);
      const report = makeReport();
      repo.create.mockResolvedValue(report as never);
      queue.add.mockResolvedValue({ id: 'job-1' } as never);

      const result = await service.create(
        ORG_ID,
        { stackId: STACK_ID, frameworkIds: ['fw-soc2'] },
        USER_ID,
      );

      expect(repo.create).toHaveBeenCalledWith(STACK_ID);
      expect(queue.add).toHaveBeenCalledWith(
        'assess',
        expect.objectContaining({ reportId: REPORT_ID, stackId: STACK_ID }),
      );
      expect(auditLog.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'report.generated' }),
      );
      expect(result.id).toBe(REPORT_ID);
    });
  });

  // ── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('throws NotFoundException when report is not found', async () => {
      repo.findOne.mockResolvedValue(null as never);

      await expect(service.findOne('nonexistent', ORG_ID)).rejects.toThrow(NotFoundException);
    });

    it('returns report when found', async () => {
      const report = makeReport();
      repo.findOne.mockResolvedValue(report as never);

      const result = await service.findOne(REPORT_ID, ORG_ID);
      expect(result.id).toBe(REPORT_ID);
    });
  });

  // ── requestPdf ────────────────────────────────────────────────────────────

  describe('requestPdf', () => {
    it('throws ForbiddenException when storage is not configured', async () => {
      repo.findOne.mockResolvedValue(makeReport() as never);
      storageService.isConfigured.mockReturnValue(false);

      await expect(service.requestPdf(REPORT_ID, ORG_ID)).rejects.toThrow(ForbiddenException);
    });

    it('enqueues PDF job and returns jobId when storage is configured', async () => {
      repo.findOne.mockResolvedValue(makeReport() as never);
      storageService.isConfigured.mockReturnValue(true);
      pdfQueue.add.mockResolvedValue({ id: 'pdf-job-1' } as never);

      const result = await service.requestPdf(REPORT_ID, ORG_ID);

      expect(pdfQueue.add).toHaveBeenCalledWith(
        'generate',
        expect.objectContaining({ reportId: REPORT_ID }),
      );
      expect(result.jobId).toBe('pdf-job-1');
    });
  });

  // ── createShareToken ──────────────────────────────────────────────────────

  describe('createShareToken', () => {
    it('returns shareUrl and expiresAt', async () => {
      repo.findOne.mockResolvedValue(makeReport() as never);
      repo.setShareToken.mockResolvedValue(undefined as never);

      const result = await service.createShareToken(REPORT_ID, ORG_ID);

      expect(result.shareUrl).toMatch(/\/share\/[a-f0-9]{64}$/);
      expect(result.expiresAt).toBeInstanceOf(Date);
      // expires ~30 days from now
      const diff = result.expiresAt.getTime() - Date.now();
      expect(diff).toBeGreaterThan(29 * 24 * 60 * 60 * 1000);
    });

    it('calls repo.setShareToken with a 64-char hex token', async () => {
      repo.findOne.mockResolvedValue(makeReport() as never);
      repo.setShareToken.mockResolvedValue(undefined as never);

      await service.createShareToken(REPORT_ID, ORG_ID);

      const [, token] = (repo.setShareToken as jest.Mock).mock.calls[0];
      expect(token).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  // ── findByShareToken ──────────────────────────────────────────────────────

  describe('findByShareToken', () => {
    it('throws NotFoundException for invalid or expired token', async () => {
      repo.findByShareToken.mockResolvedValue(null as never);

      await expect(service.findByShareToken('bad-token')).rejects.toThrow(NotFoundException);
    });

    it('returns report for a valid token', async () => {
      const report = makeReport();
      repo.findByShareToken.mockResolvedValue(report as never);

      const result = await service.findByShareToken('valid-token-abc');
      expect(result.id).toBe(REPORT_ID);
    });
  });
});
