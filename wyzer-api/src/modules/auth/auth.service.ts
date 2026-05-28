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
import { createHash, randomBytes, randomInt } from 'crypto';
import type { Response } from 'express';
import type { Env } from '../../config/env.schema';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { DisposableEmailService } from '../disposable-email/disposable-email.service';
import { EmailService } from '../email/email.service';
import { CompleteSignupDto } from './dto/complete-signup.dto';
import { LoginDto } from './dto/login.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { RegisterDto } from './dto/register.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
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
  private readonly redis: RedisService,
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
  const slug = toSlug(dto.orgName) + '-' + randomBytes(3).toString('hex');

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
   user.firstName ?? '',
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

  // OTP-only users have no password hash — cannot sign in via this endpoint
  if (!user.passwordHash)
   throw new UnauthorizedException('Invalid credentials');

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

  if (!verification)
   throw new NotFoundException('Verification token not found');
  if (verification.usedAt) {
   throw new BadRequestException(
    'This verification link has already been used',
   );
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
  if (!userId)
   throw new UnauthorizedException('Invalid or expired refresh token');

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
   user.firstName ?? '',
   `${appUrl}/auth/verify?token=${rawToken}`,
  );
 }

 // ─── OTP / passwordless auth ──────────────────────────────────────────────────

 /** Check whether an email address already has an account. */
 async checkEmail(email: string): Promise<{ exists: boolean }> {
  const user = await this.prisma.user.findUnique({
   where: { email },
   select: { id: true },
  });
  return { exists: !!user };
 }

 /** Step 1: send a 6-digit OTP to the provided email and cache signup context. */
 async requestOtp(dto: RequestOtpDto): Promise<void> {
  const isDisposable = await this.disposableEmail.isDisposable(dto.email);
  if (isDisposable) {
   throw new BadRequestException('Disposable email addresses are not allowed');
  }

  const code = randomInt(100000, 1000000).toString(); // 6 digits, crypto-secure
  const codeHash = createHash('sha256').update(code).digest('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  // Invalidate all previous unused codes for this email (prevent code stuffing)
  await this.prisma.otpCode.updateMany({
   where: { email: dto.email, usedAt: null },
   data: { usedAt: new Date() },
  });

  await this.prisma.otpCode.create({
   data: { email: dto.email, codeHash, expiresAt },
  });

  // Cache name + company + role for new-user account creation after OTP verify (30 min TTL)
  const redisClient = this.redis.getClient();
  if (redisClient) {
   await redisClient.set(
    `wyzer:otp:context:${dto.email}`,
    JSON.stringify({
     name: dto.name,
     orgName: dto.orgName,
     jobTitle: dto.jobTitle,
    }),
    'EX',
    1800,
   );
  }

  await this.emailService.enqueueOtpEmail(dto.email, code);
 }

 /** Step 2: verify OTP. Creates account for new users using cached context; signs in returning users. */
 async verifyOtp(
  dto: VerifyOtpDto,
  res: Response,
 ): Promise<{ accessToken: string; user: UserResponseDto }> {
  const codeHash = createHash('sha256').update(dto.code).digest('hex');
  const otpRecord = await this.prisma.otpCode.findUnique({
   where: { codeHash },
  });

  // Generic message to prevent email/code enumeration
  if (!otpRecord || otpRecord.email !== dto.email) {
   throw new UnauthorizedException('Invalid or expired code');
  }
  if (otpRecord.usedAt)
   throw new UnauthorizedException('Code has already been used');
  if (otpRecord.expiresAt < new Date())
   throw new UnauthorizedException('Code has expired');

  // Mark used
  await this.prisma.otpCode.update({
   where: { id: otpRecord.id },
   data: { usedAt: new Date() },
  });

  const existingUser = await this.prisma.user.findUnique({
   where: { email: dto.email },
  });

  if (existingUser) {
   // Ensure email is marked verified
   if (!existingUser.emailVerifiedAt) {
    await this.prisma.user.update({
     where: { id: existingUser.id },
     data: { emailVerifiedAt: new Date() },
    });
   }
   const { accessToken } = await this.issuePair(existingUser.id, res);
   return { accessToken, user: plainToInstance(UserResponseDto, existingUser) };
  }

  // New user — read cached context stored during requestOtp
  const redisClient = this.redis.getClient();
  let name: string | undefined;
  let orgName = 'My Organisation';
  let jobTitle = '';
  if (redisClient) {
   const raw = await redisClient.get(`wyzer:otp:context:${dto.email}`);
   if (raw) {
    try {
     const ctx = JSON.parse(raw) as {
      name?: string;
      orgName?: string;
      jobTitle?: string;
     };
     if (ctx.name) name = ctx.name;
     if (ctx.orgName) orgName = ctx.orgName;
     if (ctx.jobTitle) jobTitle = ctx.jobTitle;
    } catch {
     /* ignore malformed JSON */
    }
    await redisClient.del(`wyzer:otp:context:${dto.email}`);
   }
  }

  // Split full name into firstName / lastName
  const nameParts = (name ?? '').trim().split(/\s+/);
  const firstName = nameParts[0] || null;
  const lastName = nameParts.slice(1).join(' ') || null;

  const slug = toSlug(orgName) + '-' + randomBytes(3).toString('hex');

  const newUser = await this.prisma.$transaction(async (tx) => {
   const user = await tx.user.create({
    data: {
     email: dto.email,
     firstName,
     lastName,
     jobTitle,
     emailVerifiedAt: new Date(),
    },
   });
   const org = await tx.organisation.create({
    data: { name: orgName, slug, plan: Plan.FREE },
   });
   await tx.organisationMember.create({
    data: { userId: user.id, organisationId: org.id, role: MemberRole.OWNER },
   });
   return user;
  });

  const { accessToken } = await this.issuePair(newUser.id, res);
  return { accessToken, user: plainToInstance(UserResponseDto, newUser) };
 }

 /** Step 3 (new users only): complete signup with company + role. Issues tokens. */
 async completeSignup(
  dto: CompleteSignupDto,
  res: Response,
 ): Promise<{ accessToken: string; user: UserResponseDto }> {
  const redisClient = this.redis.getClient();
  if (!redisClient) {
   throw new BadRequestException('Session store unavailable, please try again');
  }

  const key = `wyzer:otp:pending:${dto.onboardingToken}`;
  const email = await redisClient.get(key);
  if (!email) {
   throw new UnauthorizedException('Onboarding session expired or invalid');
  }

  // Claim the token — delete before creating user to prevent replay
  await redisClient.del(key);

  // Race-condition guard: if email was registered between verifyOtp and here, sign in
  const existingUser = await this.prisma.user.findUnique({ where: { email } });
  if (existingUser) {
   const { accessToken } = await this.issuePair(existingUser.id, res);
   return { accessToken, user: plainToInstance(UserResponseDto, existingUser) };
  }

  const slug = toSlug(dto.orgName) + '-' + randomBytes(3).toString('hex');

  const user = await this.prisma.$transaction(async (tx) => {
   const newUser = await tx.user.create({
    data: {
     email,
     jobTitle: dto.jobTitle,
     emailVerifiedAt: new Date(), // verified via OTP
    },
   });

   const org = await tx.organisation.create({
    data: { name: dto.orgName, slug, plan: Plan.FREE },
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

  const { accessToken } = await this.issuePair(user.id, res);
  return { accessToken, user: plainToInstance(UserResponseDto, user) };
 }

 // ─── Profile ─────────────────────────────────────────────────────────────────

 async getMe(userId: string) {
  const user = await this.prisma.user.findUniqueOrThrow({
   where: { id: userId },
   select: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    jobTitle: true,
   },
  });
  return user;
 }

 async updateMe(
  userId: string,
  dto: { firstName?: string; lastName?: string; jobTitle?: string },
 ) {
  const user = await this.prisma.user.update({
   where: { id: userId },
   data: {
    ...(dto.firstName !== undefined && { firstName: dto.firstName }),
    ...(dto.lastName !== undefined && { lastName: dto.lastName }),
    ...(dto.jobTitle !== undefined && { jobTitle: dto.jobTitle }),
   },
   select: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    jobTitle: true,
   },
  });
  return user;
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
