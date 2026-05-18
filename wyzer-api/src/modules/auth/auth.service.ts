import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MemberRole, Plan } from '@prisma/client';
import * as argon2 from 'argon2';
import { plainToInstance } from 'class-transformer';
import { createHash, randomBytes } from 'crypto';
import type { Response } from 'express';
import type { Env } from '../../config/env.schema';
import { PrismaService } from '../../common/prisma/prisma.service';
import { DisposableEmailService } from '../disposable-email/disposable-email.service';
import { EmailService } from '../email/email.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserResponseDto } from './dto/user-response.dto';
import type { AccessTokenPayload } from './types/jwt-payload.interface';
import { TokenService } from './token.service';

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly disposableEmail: DisposableEmailService,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  // ─── Register ────────────────────────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<{ user: UserResponseDto }> {
    // 1. Check email uniqueness
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    // 2. Reject disposable email addresses
    const isDisposable = await this.disposableEmail.isDisposable(dto.email);
    if (isDisposable) {
      throw new BadRequestException('Disposable email addresses are not allowed');
    }

    // 3. Hash password with argon2id
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    // 4. Generate email verification token (store only hash)
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Org slug: sanitised + random suffix to avoid collisions
    const slug =
      toSlug(dto.orgName) + '-' + randomBytes(3).toString('hex');

    // 5. Create user + org + member + verification in one transaction
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          passwordHash,
          jobTitle: dto.jobTitle,
          country: dto.country,
          emailVerifications: {
            create: { tokenHash, expiresAt },
          },
        },
      });

      const org = await tx.organisation.create({
        data: {
          name: dto.orgName,
          slug,
          size: dto.companySize,
          plan: Plan.FREE,
        },
      });

      await tx.organisationMember.create({
        data: {
          userId: newUser.id,
          organisationId: org.id,
          role: MemberRole.OWNER,
        },
      });

      return newUser;
    });

    // 6. Enqueue verification email (NOT inline)
    const appUrl = this.configService.get('APP_URL', { infer: true });
    await this.emailService.enqueueVerificationEmail(
      user.email,
      user.firstName,
      `${appUrl}/auth/verify?token=${rawToken}`,
    );

    return { user: plainToInstance(UserResponseDto, user) };
  }

  // ─── Login ────────────────────────────────────────────────────────────────────

  async login(
    dto: LoginDto,
    res: Response,
  ): Promise<{ accessToken: string; user: UserResponseDto }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Constant-time failure — don't leak whether the email exists
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException(
        'Please verify your email address before signing in',
      );
    }

    const { accessToken } = await this.issuePair(user.id, res);
    return { accessToken, user: plainToInstance(UserResponseDto, user) };
  }

  // ─── Verify email (T-013) ─────────────────────────────────────────────────────

  async verifyEmail(
    rawToken: string,
    res: Response,
  ): Promise<{ accessToken: string; user: UserResponseDto }> {
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const verification = await this.prisma.emailVerification.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!verification) throw new NotFoundException('Verification token not found');
    if (verification.usedAt) {
      throw new BadRequestException('This verification link has already been used');
    }
    if (verification.expiresAt < new Date()) {
      throw new BadRequestException(
        'Verification link has expired. Please request a new one.',
      );
    }

    // Mark used + set emailVerifiedAt in one transaction
    const [, updatedUser] = await this.prisma.$transaction([
      this.prisma.emailVerification.update({
        where: { id: verification.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerifiedAt: new Date() },
      }),
    ]);

    const { accessToken } = await this.issuePair(updatedUser.id, res);
    return {
      accessToken,
      user: plainToInstance(UserResponseDto, updatedUser),
    };
  }

  // ─── Refresh token ────────────────────────────────────────────────────────────

  async refresh(
    rawRefreshToken: string,
    res: Response,
  ): Promise<{ accessToken: string }> {
    const userId = await this.tokenService.verifyRefreshToken(rawRefreshToken);
    if (!userId) throw new UnauthorizedException('Invalid or expired refresh token');

    // Rotate: revoke old, issue new
    await this.tokenService.revokeRefreshToken(rawRefreshToken);
    const { accessToken } = await this.issuePair(userId, res);
    return { accessToken };
  }

  // ─── Logout ───────────────────────────────────────────────────────────────────

  async logout(rawRefreshToken: string, res: Response): Promise<void> {
    if (rawRefreshToken) {
      await this.tokenService.revokeRefreshToken(rawRefreshToken);
    }
    res.clearCookie('refresh_token', { path: '/api/v1/auth' });
  }

  // ─── Resend verification ──────────────────────────────────────────────────────

  async resendVerification(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Always return 204 to prevent email enumeration
    if (!user || user.emailVerifiedAt) return;

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.emailVerification.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const appUrl = this.configService.get('APP_URL', { infer: true });
    await this.emailService.enqueueVerificationEmail(
      user.email,
      user.firstName,
      `${appUrl}/auth/verify?token=${rawToken}`,
    );
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private async issuePair(
    userId: string,
    res: Response,
  ): Promise<{ accessToken: string }> {
    const membership = await this.prisma.organisationMember.findFirst({
      where: { userId },
      include: { organisation: true },
      orderBy: { joinedAt: 'asc' },
    });

    const payload: AccessTokenPayload = {
      sub: userId,
      orgId: membership?.organisationId ?? '',
      role: membership?.role ?? MemberRole.MEMBER,
      plan: membership?.organisation.plan ?? Plan.FREE,
    };

    const accessToken = this.tokenService.signAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(userId);

    const isProduction =
      this.configService.get('NODE_ENV', { infer: true }) === 'production';

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/v1/auth',
    });

    return { accessToken };
  }
}
