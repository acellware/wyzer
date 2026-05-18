import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Resend } from 'resend';
import type { Env } from '../../config/env.schema';
import { buildVerificationEmail } from './templates/verification.template';

export interface SendVerificationPayload {
  to: string;
  firstName: string;
  verificationUrl: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;

  constructor(
    private readonly configService: ConfigService<Env, true>,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {
    const apiKey = this.configService.get('RESEND_API_KEY', { infer: true });
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  /**
   * Enqueues a verification email job via BullMQ.
   * Falls back to inline send if the queue is unavailable.
   */
  async enqueueVerificationEmail(
    to: string,
    firstName: string,
    verificationUrl: string,
  ): Promise<void> {
    try {
      await this.emailQueue.add('send-verification', {
        to,
        firstName,
        verificationUrl,
      });
    } catch (err) {
      this.logger.warn(
        'Email queue unavailable — sending inline',
        err instanceof Error ? err.message : String(err),
      );
      await this.sendVerificationEmail(to, firstName, verificationUrl);
    }
  }

  /** Sends the verification email directly via Resend. Called by the processor. */
  async sendVerificationEmail(
    to: string,
    firstName: string,
    verificationUrl: string,
  ): Promise<void> {
    if (!this.resend) {
      this.logger.log(
        `[DEV] Verification email\nTo: ${to}\nURL: ${verificationUrl}`,
      );
      return;
    }

    const html = buildVerificationEmail(firstName, verificationUrl);

    await this.resend.emails.send({
      from: this.configService.get('EMAIL_FROM', { infer: true }),
      to,
      subject: 'Verify your Wyzer account',
      html,
    });
  }

  /** Sends an organisation invite email directly via Resend. */
  async sendInviteEmail(to: string, orgName: string, inviteUrl: string): Promise<void> {
    if (!this.resend) {
      this.logger.log(`[DEV] Invite email\nTo: ${to}\nOrg: ${orgName}\nURL: ${inviteUrl}`);
      return;
    }

    await this.resend.emails.send({
      from: this.configService.get('EMAIL_FROM', { infer: true }),
      to,
      subject: `You've been invited to join ${orgName} on Wyzer`,
      html: `
        <p>You've been invited to join <strong>${orgName}</strong> on Wyzer.</p>
        <p><a href="${inviteUrl}">Accept invitation</a></p>
        <p>This link expires in 7 days.</p>
      `,
    });
  }
}
