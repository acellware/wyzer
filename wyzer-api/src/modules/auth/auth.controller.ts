import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RateLimit, RateLimitGuard } from '../../common/guards/rate-limit.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** POST /auth/register — T-010 */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 10, windowSeconds: 900 }) // 10 per 15 min
  @ApiCreatedResponse({ description: 'User registered. Verification email sent.' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /** POST /auth/login */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 10, windowSeconds: 600 }) // 10 per 10 min
  @ApiOkResponse({ description: 'Returns access token. Sets httpOnly refresh cookie.' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(dto, res);
  }

  /** GET /auth/verify?token= — T-013 */
  @Get('verify')
  @ApiOkResponse({ description: 'Email verified. Returns access token.' })
  async verifyEmail(
    @Query('token') token: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!token) throw new BadRequestException('token query parameter is required');
    return this.authService.verifyEmail(token, res);
  }

  /** POST /auth/refresh — rotates refresh token */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Returns new access token. Rotates refresh cookie.' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req.cookies as Record<string, string | undefined>)['refresh_token'];
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
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req.cookies as Record<string, string | undefined>)['refresh_token'] ?? '';
    await this.authService.logout(refreshToken, res);
  }

  /** POST /auth/verify-email/resend — T-018 */
  @Post('verify-email/resend')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Resent verification email (if applicable).' })
  async resendVerification(@Body() dto: ResendVerificationDto) {
    await this.authService.resendVerification(dto.email);
  }
}
