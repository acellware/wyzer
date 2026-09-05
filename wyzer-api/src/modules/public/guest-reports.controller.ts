import {
 Body,
 Controller,
 Get,
 Headers,
 Param,
 Post,
 Req,
 UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { GuestReportsService } from './guest-reports.service';
import { CreateGuestReportDto } from './dto/create-guest-report.dto';
import {
 RateLimit,
 RateLimitGuard,
} from '../../common/guards/rate-limit.guard';

@ApiTags('Public')
@UseGuards(RateLimitGuard)
@Controller('public/guest-reports')
export class GuestReportsController {
 constructor(private readonly service: GuestReportsService) {}

 /**
  * Run a free compliance check. No auth required.
  * Rate limited per IP: 5 scans / 10 min.
  * Per-email cap is enforced in the service (5 / 24h).
  */
 @Post()
 @RateLimit({ limit: 5, windowSeconds: 600 })
 @ApiOperation({
  summary: 'Run a guest compliance check (public, unauthenticated)',
 })
 async create(
  @Body() dto: CreateGuestReportDto,
  @Req() req: Request,
  @Headers('referer') referer?: string,
  @Headers('user-agent') userAgent?: string,
 ) {
  const ip =
   (req.headers['x-forwarded-for'] as string | undefined)
    ?.split(',')[0]
    ?.trim() ??
   req.socket.remoteAddress ??
   undefined;

  return this.service.create(dto, { ip, userAgent, referrer: referer });
 }

 @Get(':token')
 @RateLimit({ limit: 60, windowSeconds: 60 })
 @ApiOperation({ summary: 'Fetch a guest report by share token (public)' })
 findByToken(@Param('token') token: string) {
  return this.service.findByToken(token);
 }
}
