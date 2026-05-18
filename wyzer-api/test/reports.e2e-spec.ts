/**
 * T-061 — Reports integration tests (Supertest)
 *
 * Tests HTTP layer for the reports resource:
 * - Auth guard enforcement (401 without token)
 * - Request validation (400 on invalid body)
 * - Happy-path responses (201/200) with mocked service
 */
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe, UnauthorizedException } from '@nestjs/common';
import { ReportsController } from '../src/modules/reports/reports.controller';
import { ReportsService } from '../src/modules/reports/reports.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { PlanGuard } from '../src/common/guards/plan.guard';
import cookieParser from 'cookie-parser';
import { TEST_ORG_ID, TEST_USER_ID, mockJwtGuard } from './helpers/test-app';

// Avoid pulling in puppeteer (ESM) from pdf.service at module resolution time
jest.mock('../src/modules/pdf/pdf.service', () => ({
  PDF_QUEUE: 'pdf-generation',
  PdfService: class {},
}));

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockReportsService = {
  create: jest.fn(),
  findOne: jest.fn(),
  requestPdf: jest.fn(),
  createShareToken: jest.fn(),
  findByShareToken: jest.fn(),
};

const noOpPlanGuard = { canActivate: () => true };
const rejectJwtGuard = { canActivate: () => { throw new UnauthorizedException(); } };

// ── App factory ───────────────────────────────────────────────────────────────

async function buildReportsApp(withAuth = true): Promise<INestApplication> {
  const builder = Test.createTestingModule({
    controllers: [ReportsController],
    providers: [{ provide: ReportsService, useValue: mockReportsService }],
  }).overrideGuard(PlanGuard).useValue(noOpPlanGuard);

  if (withAuth) {
    builder.overrideGuard(JwtAuthGuard).useValue(mockJwtGuard);
  } else {
    builder.overrideGuard(JwtAuthGuard).useValue(rejectJwtGuard);
  }

  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication();
  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();
  return app;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Reports routes — auth guard (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await buildReportsApp(false);
  });

  afterAll(() => app.close());

  it('POST /reports returns 401 without a bearer token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/reports')
      .send({ stackId: 'stack-1', frameworkIds: ['fw-1'] })
      .expect(401);
  });

  it('GET /reports/:id returns 401 without a bearer token', async () => {
    await request(app.getHttpServer()).get('/api/v1/reports/report-1').expect(401);
  });
});

describe('Reports routes — authenticated (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await buildReportsApp(true);
  });

  afterAll(() => app.close());

  beforeEach(() => jest.clearAllMocks());

  // ── POST /reports ─────────────────────────────────────────────────────────

  describe('POST /api/v1/reports', () => {
    it('returns 400 when stackId is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/reports')
        .send({ frameworkIds: ['fw-1'] })
        .expect(400);
    });

    it('returns 400 when frameworkIds is empty', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/reports')
        .send({ stackId: 'stack-1', frameworkIds: [] })
        .expect(400);
    });

    it('returns 400 when frameworkIds is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/reports')
        .send({ stackId: 'stack-1' })
        .expect(400);
    });

    it('returns 201 with created report on valid body', async () => {
      const report = { id: 'report-1', stackId: 'stack-1', status: 'PENDING' };
      mockReportsService.create.mockResolvedValueOnce(report);

      const res = await request(app.getHttpServer())
        .post('/api/v1/reports')
        .send({ stackId: 'stack-1', frameworkIds: ['fw-soc2', 'fw-gdpr'] })
        .expect(201);

      expect(res.body.id).toBe('report-1');
      expect(mockReportsService.create).toHaveBeenCalledWith(
        TEST_ORG_ID,
        expect.objectContaining({ stackId: 'stack-1', frameworkIds: ['fw-soc2', 'fw-gdpr'] }),
        TEST_USER_ID,
      );
    });
  });

  // ── GET /reports/:id ──────────────────────────────────────────────────────

  describe('GET /api/v1/reports/:id', () => {
    it('returns 200 with report when found', async () => {
      const report = { id: 'report-1', status: 'COMPLETE', result: {} };
      mockReportsService.findOne.mockResolvedValueOnce(report);

      const res = await request(app.getHttpServer())
        .get('/api/v1/reports/report-1')
        .expect(200);

      expect(res.body.id).toBe('report-1');
      expect(mockReportsService.findOne).toHaveBeenCalledWith('report-1', TEST_ORG_ID);
    });

    it('returns 404 when report not found', async () => {
      const { NotFoundException } = await import('@nestjs/common');
      mockReportsService.findOne.mockRejectedValueOnce(
        new NotFoundException('Report not found'),
      );

      await request(app.getHttpServer())
        .get('/api/v1/reports/nonexistent')
        .expect(404);
    });
  });

  // ── POST /reports/:id/share ───────────────────────────────────────────────

  describe('POST /api/v1/reports/:id/share', () => {
    it('returns 201 with shareUrl', async () => {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      mockReportsService.createShareToken.mockResolvedValueOnce({
        shareUrl: 'http://localhost:3000/share/abc123',
        expiresAt,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/reports/report-1/share')
        .expect(201);

      expect(res.body.shareUrl).toContain('/share/');
    });
  });
});
