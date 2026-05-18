/**
 * T-061 — Auth integration tests (Supertest)
 *
 * These tests exercise the HTTP layer: request validation (ValidationPipe),
 * route availability, and error responses. The database and email services
 * are mocked so no real infrastructure is required.
 */
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { RateLimitGuard } from '../src/common/guards/rate-limit.guard';
import cookieParser from 'cookie-parser';

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  verifyEmail: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
};

// Bypass rate-limit guard in tests
const noOpGuard = { canActivate: () => true };

async function buildAuthApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    controllers: [AuthController],
    providers: [{ provide: AuthService, useValue: mockAuthService }],
  })
    .overrideGuard(RateLimitGuard)
    .useValue(noOpGuard)
    .compile();

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

// ── Tests ────────────────────────────────────────────────────────────────────

describe('Auth routes (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await buildAuthApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── POST /auth/register ───────────────────────────────────────────────────

  describe('POST /api/v1/auth/register', () => {
    it('returns 400 when body is empty', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({})
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });

    it('returns 400 when email is invalid', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'not-an-email',
          password: 'SecurePassword1!',
          jobTitle: 'Engineer',
          country: 'GB',
          orgName: 'Acme',
          companySize: 'SMALL',
        })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });

    it('returns 400 when password is too short', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@acme.com',
          password: 'short',
          jobTitle: 'Engineer',
          country: 'GB',
          orgName: 'Acme',
          companySize: 'SMALL',
        })
        .expect(400);
    });

    it('delegates valid registration to AuthService', async () => {
      mockAuthService.register.mockResolvedValueOnce({
        user: { id: 'u-1', email: 'jane@acme.com' },
      });

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@acme.com',
          password: 'SecurePassword1!',
          jobTitle: 'Engineer',
          country: 'GB',
          orgName: 'Acme Corp',
          companySize: 'SMALL',
        })
        .expect(201);

      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
    });
  });

  // ── POST /auth/login ──────────────────────────────────────────────────────

  describe('POST /api/v1/auth/login', () => {
    it('returns 400 when body is empty', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);
    });

    it('returns 400 when email field is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ password: 'SomePass123' })
        .expect(400);
    });

    it('propagates 401 from AuthService when credentials are invalid', async () => {
      const { UnauthorizedException } = await import('@nestjs/common');
      mockAuthService.login.mockRejectedValueOnce(
        new UnauthorizedException('Invalid credentials'),
      );

      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'jane@acme.com', password: 'wrongpass' })
        .expect(401);
    });

    it('returns 200 with access token on valid credentials', async () => {
      mockAuthService.login.mockResolvedValueOnce({
        accessToken: 'test.jwt.token',
        user: { id: 'u-1', email: 'jane@acme.com' },
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'jane@acme.com', password: 'CorrectPass1!' })
        .expect(200);

      expect(res.body.accessToken).toBe('test.jwt.token');
    });
  });
});
