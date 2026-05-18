/**
 * T-061 — Stacks integration tests (Supertest)
 *
 * Tests HTTP layer for the stacks resource:
 * - Auth guard enforcement (401 without token)
 * - Request validation (400 on invalid body)
 * - Happy-path responses (201/200) with mocked service
 */
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe, UnauthorizedException } from '@nestjs/common';
import { Plan } from '@prisma/client';
import { StacksController } from '../src/modules/stacks/stacks.controller';
import { StacksService } from '../src/modules/stacks/stacks.service';
import { AuditLogService } from '../src/modules/audit-log/audit-log.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import cookieParser from 'cookie-parser';
import { TEST_ORG_ID, TEST_USER_ID, mockJwtGuard } from './helpers/test-app';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockStacksService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  addItem: jest.fn(),
  patchItem: jest.fn(),
  removeItem: jest.fn(),
};

// Guard that always rejects with 401 (simulates no/invalid bearer token)
const rejectJwtGuard = { canActivate: () => { throw new UnauthorizedException(); } };

async function buildStacksApp(withAuth = true): Promise<INestApplication> {
  const builder = Test.createTestingModule({
    controllers: [StacksController],
    providers: [
      { provide: StacksService, useValue: mockStacksService },
      { provide: AuditLogService, useValue: { record: jest.fn() } },
    ],
  });

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

describe('Stacks routes — auth guard (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // withAuth=false → real guard, no JWT strategy → always 401
    app = await buildStacksApp(false);
  });

  afterAll(() => app.close());

  it('GET /stacks returns 401 without a bearer token', async () => {
    await request(app.getHttpServer()).get('/api/v1/stacks').expect(401);
  });

  it('POST /stacks returns 401 without a bearer token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/stacks')
      .send({ name: 'My Stack' })
      .expect(401);
  });
});

describe('Stacks routes — authenticated (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await buildStacksApp(true);
  });

  afterAll(() => app.close());

  beforeEach(() => jest.clearAllMocks());

  // ── GET /stacks ──────────────────────────────────────────────────────────

  describe('GET /api/v1/stacks', () => {
    it('returns 200 with empty array when no stacks exist', async () => {
      mockStacksService.findAll.mockResolvedValueOnce([]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/stacks')
        .expect(200);

      expect(res.body).toEqual([]);
      expect(mockStacksService.findAll).toHaveBeenCalledWith(TEST_ORG_ID);
    });

    it('returns 200 with stack list', async () => {
      const stacks = [{ id: 'stack-1', name: 'Production', items: [] }];
      mockStacksService.findAll.mockResolvedValueOnce(stacks);

      const res = await request(app.getHttpServer())
        .get('/api/v1/stacks')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('stack-1');
    });
  });

  // ── POST /stacks ─────────────────────────────────────────────────────────

  describe('POST /api/v1/stacks', () => {
    it('returns 400 when name is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/stacks')
        .send({})
        .expect(400);
    });

    it('returns 201 with created stack on valid body', async () => {
      const stack = { id: 'stack-2', name: 'Alpha Stack', items: [] };
      mockStacksService.create.mockResolvedValueOnce(stack);

      const res = await request(app.getHttpServer())
        .post('/api/v1/stacks')
        .send({ name: 'Alpha Stack' })
        .expect(201);

      expect(res.body.id).toBe('stack-2');
      expect(mockStacksService.create).toHaveBeenCalledWith(
        TEST_ORG_ID,
        expect.objectContaining({ name: 'Alpha Stack' }),
        TEST_USER_ID,
        Plan.PRO,
      );
    });
  });

  // ── GET /stacks/:id ───────────────────────────────────────────────────────

  describe('GET /api/v1/stacks/:id', () => {
    it('returns 200 with the stack when found', async () => {
      const stack = { id: 'stack-1', name: 'Production', items: [] };
      mockStacksService.findOne.mockResolvedValueOnce(stack);

      const res = await request(app.getHttpServer())
        .get('/api/v1/stacks/stack-1')
        .expect(200);

      expect(res.body.id).toBe('stack-1');
    });

    it('returns 404 when stack does not exist', async () => {
      const { NotFoundException } = await import('@nestjs/common');
      mockStacksService.findOne.mockRejectedValueOnce(
        new NotFoundException('Stack not found'),
      );

      await request(app.getHttpServer())
        .get('/api/v1/stacks/nonexistent')
        .expect(404);
    });
  });

  // ── DELETE /stacks/:id ────────────────────────────────────────────────────

  describe('DELETE /api/v1/stacks/:id', () => {
    it('returns 204 on successful delete', async () => {
      mockStacksService.delete.mockResolvedValueOnce(undefined);

      await request(app.getHttpServer())
        .delete('/api/v1/stacks/stack-1')
        .expect(204);
    });
  });
});
