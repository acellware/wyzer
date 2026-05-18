import {
  Body,
  Controller,
  Headers,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { BillingService } from './billing.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly service: BillingService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a Stripe Checkout session for a plan upgrade' })
  createCheckout(
    @CurrentUser('orgId') orgId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.service.createCheckoutSession(orgId, userId, dto.plan);
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a Stripe Customer Portal session' })
  createPortal(@CurrentUser('orgId') orgId: string) {
    return this.service.createPortalSession(orgId);
  }

  /**
   * Stripe webhook endpoint — must receive the raw body for signature verification.
   * NestJS raw body parsing is enabled via {rawBody: true} on NestFactory.create().
   */
  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook receiver (no auth)' })
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) throw new Error('Raw body not available — enable rawBody in NestFactory');
    return this.service.handleWebhook(rawBody, signature);
  }
}
