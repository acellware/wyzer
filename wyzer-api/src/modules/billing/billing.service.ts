import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Plan } from '@prisma/client';
import { BillingPlan } from './dto/create-checkout.dto';
import type { Env } from '../../config/env.schema';

// Map BillingPlan → Stripe price ID env var names
const PRICE_ENV_MAP: Record<BillingPlan, keyof Env> = {
  [BillingPlan.PRO]: 'STRIPE_PRICE_PRO',
  [BillingPlan.TEAM]: 'STRIPE_PRICE_TEAM',
};

// Map Stripe product metadata plan values → Prisma Plan enum
const PLAN_MAP: Record<string, Plan> = {
  pro: Plan.PRO,
  team: Plan.TEAM,
  free: Plan.FREE,
};

// Stripe v22 uses `export =` which makes the namespace inaccessible for types;
// `Stripe.Stripe` is the instance type exposed via the module namespace member.
type StripeClient = Stripe.Stripe;

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly stripe: StripeClient | null;

  constructor(
    private readonly config: ConfigService<Env, true>,
    private readonly prisma: PrismaService,
  ) {
    const secretKey = config.get('STRIPE_SECRET_KEY', { infer: true });
    this.stripe = secretKey ? new Stripe(secretKey) : null;
  }

  private requireStripe(): StripeClient {
    if (!this.stripe) throw new Error('Stripe is not configured — set STRIPE_SECRET_KEY');
    return this.stripe;
  }

  /**
   * Creates or reuses a Stripe Customer for the organisation, then
   * creates a Checkout session for the requested plan.
   * Returns the Checkout session URL.
   */
  async createCheckoutSession(
    organisationId: string,
    userId: string,
    plan: BillingPlan,
  ): Promise<{ url: string }> {
    const stripe = this.requireStripe();

    const [org, user] = await Promise.all([
      this.prisma.organisation.findUnique({
        where: { id: organisationId },
        select: { id: true, name: true, stripeCustomerId: true },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      }),
    ]);

    if (!org) throw new NotFoundException('Organisation not found');

    // Reuse existing Stripe customer or create a new one
    let customerId = org.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email,   
        name: org.name,
        metadata: { organisationId },
      });
      customerId = customer.id;
      await this.prisma.organisation.update({
        where: { id: organisationId },
        data: { stripeCustomerId: customerId },
      });
    }

    const priceEnvKey = PRICE_ENV_MAP[plan];
    const priceId = this.config.get(priceEnvKey, { infer: true }) as string | undefined;

    if (!priceId) {
      throw new Error(`${priceEnvKey} is not set — configure Stripe price IDs`);
    }

    const appUrl = this.config.get('APP_URL', { infer: true });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?billing=success`,
      cancel_url: `${appUrl}/dashboard?billing=cancelled`,
      metadata: { organisationId, plan },
    });

    return { url: session.url! };
  }

  /**
   * Creates a Stripe Customer Portal session so users can manage their
   * subscription, payment method, and invoices.
   */
  async createPortalSession(organisationId: string): Promise<{ url: string }> {
    const stripe = this.requireStripe();

    const org = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
      select: { stripeCustomerId: true },
    });

    if (!org?.stripeCustomerId) {
      throw new NotFoundException('No billing account found for this organisation');
    }

    const appUrl = this.config.get('APP_URL', { infer: true });

    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: `${appUrl}/dashboard`,
    });

    return { url: session.url };
  }

  /**
   * Handle Stripe webhook events.
   * Verifies the signature, then dispatches to the appropriate handler.
   */
  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const stripe = this.requireStripe();
    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET', { infer: true });

    if (!webhookSecret) {
      this.logger.warn('STRIPE_WEBHOOK_SECRET not set — skipping signature verification');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let event: any;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${(err as Error).message}`);
      throw err;
    }

    switch (event.type) {
      case 'checkout.session.completed':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await this.onCheckoutCompleted(event.data.object as any);
        break;
      case 'customer.subscription.updated':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await this.onSubscriptionUpdated(event.data.object as any);
        break;
      case 'customer.subscription.deleted':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await this.onSubscriptionDeleted(event.data.object as any);
        break;
      default:
        this.logger.log(`Unhandled Stripe event: ${event.type}`);
    }
  }

  private async onCheckoutCompleted(session: { metadata: Record<string, string> | null; subscription: string | null }) {
    const organisationId = session.metadata?.organisationId;
    const plan = session.metadata?.plan as BillingPlan | undefined;

    if (!organisationId || !plan) return;

    const newPlan = PLAN_MAP[plan] ?? Plan.FREE;
    await this.prisma.organisation.update({
      where: { id: organisationId },
      data: { plan: newPlan },
    });

    this.logger.log(`Organisation ${organisationId} upgraded to ${newPlan}`);
  }

  private async onSubscriptionUpdated(subscription: { customer: string | { id: string }; status: string }) {
    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;

    const org = await this.prisma.organisation.findFirst({
      where: { stripeCustomerId: customerId },
      select: { id: true },
    });

    if (!org) return;

    // Derive plan from subscription status
    const isActive = subscription.status === 'active' || subscription.status === 'trialing';
    if (!isActive) {
      await this.prisma.organisation.update({
        where: { id: org.id },
        data: { plan: Plan.FREE },
      });
    }
  }

  private async onSubscriptionDeleted(subscription: { customer: string | { id: string } }) {
    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;

    const org = await this.prisma.organisation.findFirst({
      where: { stripeCustomerId: customerId },
      select: { id: true },
    });

    if (!org) return;

    await this.prisma.organisation.update({
      where: { id: org.id },
      data: { plan: Plan.FREE },
    });

    this.logger.log(`Organisation ${org.id} downgraded to FREE (subscription deleted)`);
  }
}
