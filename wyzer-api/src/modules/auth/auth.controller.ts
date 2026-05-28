import {
 BadRequestException,
 Body,
 Controller,
 Get,
 HttpCode,
 HttpStatus,
 Patch,
 Post,
 Query,
 Req,
 Res,
 UseGuards,
} from '@nestjs/common';
import {
 ApiBearerAuth,
 ApiNoContentResponse,
 ApiOkResponse,
 ApiTags,
 ApiCreatedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CheckEmailDto } from './dto/check-email.dto';
import { CompleteSignupDto } from './dto/complete-signup.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import {
 RateLimit,
 RateLimitGuard,
} from '../../common/guards/rate-limit.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
 constructor(private readonly authService: AuthService) {}

 /** POST /auth/register — T-010 */
 @Post('register')
 @HttpCode(HttpStatus.CREATED)
 @UseGuards(RateLimitGuard)
 @RateLimit({ limit: 10, windowSeconds: 900 }) // 10 per 15 min
 @ApiCreatedResponse({
  description: 'User registered. Verification email sent.',
 })
 async register(@Body() dto: RegisterDto) {
  return this.authService.register(dto);
 }

 /** POST /auth/login */
 @Post('login')
 @HttpCode(HttpStatus.OK)
 @UseGuards(RateLimitGuard)
 @RateLimit({ limit: 10, windowSeconds: 600 }) // 10 per 10 min
 @ApiOkResponse({
  description: 'Returns access token. Sets httpOnly refresh cookie.',
 })
 async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
  return this.authService.login(dto, res);
 }

 /** GET /auth/verify?token= — T-013 */
 @Get('verify')
 @ApiOkResponse({ description: 'Email verified. Returns access token.' })
 async verifyEmail(
  @Query('token') token: string | undefined,
  @Res({ passthrough: true }) res: Response,
 ) {
  if (!token)
   throw new BadRequestException('token query parameter is required');
  return this.authService.verifyEmail(token, res);
 }

 /** POST /auth/refresh — rotates refresh token */
 @Post('refresh')
 @HttpCode(HttpStatus.OK)
 @ApiOkResponse({
  description: 'Returns new access token. Rotates refresh cookie.',
 })
 async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
  const refreshToken = (req.cookies as Record<string, string | undefined>)[
   'refresh_token'
  ];
  if (!refreshToken) {
   throw new BadRequestException('No refresh token cookie present');
  }
  return this.authService.refresh(refreshToken, res);
 }

 /** POST /auth/logout */
 @Post('logout')
 @UseGuards(JwtAuthGuard)
 @HttpCode(HttpStatus.NO_CONTENT)
 @ApiBearerAuth('access-token')
 @ApiNoContentResponse({ description: 'Logged out.' })
 async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
  const refreshToken =
   (req.cookies as Record<string, string | undefined>)['refresh_token'] ?? '';
  await this.authService.logout(refreshToken, res);
 }

 /** POST /auth/verify-email/resend — T-018 */
 @Post('verify-email/resend')
 @HttpCode(HttpStatus.NO_CONTENT)
 @ApiNoContentResponse({
  description: 'Resent verification email (if applicable).',
 })
 async resendVerification(@Body() dto: ResendVerificationDto) {
  await this.authService.resendVerification(dto.email);
 }

 // ─── OTP / passwordless auth ──────────────────────────────────────────────────

 /** POST /auth/otp/check — returns { exists } without leaking timing */
 @Post('otp/check')
 @HttpCode(HttpStatus.OK)
 @UseGuards(RateLimitGuard)
 @RateLimit({ limit: 20, windowSeconds: 60 }) // 20 per minute
 @ApiOkResponse({ description: 'Returns { exists: boolean }.' })
 async checkEmail(@Body() dto: CheckEmailDto) {
  return this.authService.checkEmail(dto.email);
 }

 /** POST /auth/otp/request — sends a 6-digit code to the given email */
 @Post('otp/request')
 @HttpCode(HttpStatus.NO_CONTENT)
 @UseGuards(RateLimitGuard)
 @RateLimit({ limit: 5, windowSeconds: 60 }) // 5 per minute
 @ApiNoContentResponse({
  description: 'OTP sent (or queued) to the provided email.',
 })
 async requestOtp(@Body() dto: RequestOtpDto) {
  await this.authService.requestOtp(dto);
 }

 /** POST /auth/otp/verify — validates the code; returns tokens or onboardingToken */
 @Post('otp/verify')
 @HttpCode(HttpStatus.OK)
 @UseGuards(RateLimitGuard)
 @RateLimit({ limit: 10, windowSeconds: 300 }) // 10 per 5 min
 @ApiOkResponse({
  description:
   'Code valid. Returning user: access token. New user: onboardingToken.',
 })
 async verifyOtp(
  @Body() dto: VerifyOtpDto,
  @Res({ passthrough: true }) res: Response,
 ) {
  return this.authService.verifyOtp(dto, res);
 }

 /** POST /auth/otp/complete — new users: supply company + role to finalise account */
 @Post('otp/complete')
 @HttpCode(HttpStatus.OK)
 @UseGuards(RateLimitGuard)
 @RateLimit({ limit: 10, windowSeconds: 300 }) // 10 per 5 min
 @ApiOkResponse({ description: 'Account created. Returns access token.' })
 async completeSignup(
  @Body() dto: CompleteSignupDto,
  @Res({ passthrough: true }) res: Response,
 ) {
  return this.authService.completeSignup(dto, res);
 }

 /** GET /auth/me — returns the currently authenticated user's profile */
 @Get('me')
 @UseGuards(JwtAuthGuard)
 @ApiBearerAuth('access-token')
 @ApiOkResponse({ description: 'Returns the current user profile.' })
 async getMe(@CurrentUser('sub') userId: string) {
  return this.authService.getMe(userId);
 }

 /** PATCH /auth/me — updates the current user's profile fields */
 @Patch('me')
 @UseGuards(JwtAuthGuard)
 @ApiBearerAuth('access-token')
 @ApiOkResponse({ description: 'Returns the updated user profile.' })
 async updateMe(
  @CurrentUser('sub') userId: string,
  @Body() dto: UpdateProfileDto,
 ) {
  return this.authService.updateMe(userId, dto);
 }
}
