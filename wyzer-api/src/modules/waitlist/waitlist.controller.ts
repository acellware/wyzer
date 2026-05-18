import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { Logger } from '@nestjs/common';
import { WaitlistDto } from './dto/waitlist.dto';
import type { Env } from '../../config/env.schema';

@ApiTags('Waitlist')
@Controller('waitlist')
export class WaitlistController {
  private readonly logger = new Logger(WaitlistController.name);
  private readonly resend: Resend | null;

  constructor(private readonly config: ConfigService<Env, true>) {
    const apiKey = config.get('RESEND_API_KEY', { infer: true });
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Join the Wyzer waitlist / newsletter' })
  async join(@Body() dto: WaitlistDto) {
    if (this.resend) {
      try {
        await this.resend.emails.send({
          from: this.config.get('EMAIL_FROM', { infer: true }),
          to: dto.email,
          subject: "You're on the Wyzer list",
          html: `
            <p>Thanks for your interest in Wyzer!</p>
            <p>We'll reach out when new features land. In the meantime, you can
            <a href="${this.config.get('APP_URL', { infer: true })}/register">create a free account</a>.</p>
          `,
        });
      } catch (err) {
        this.logger.warn(`Waitlist email failed: ${(err as Error).message}`);
      }
    } else {
      this.logger.log(`[DEV] Waitlist signup: ${dto.email}`);
    }

    return { message: 'Thanks! We will be in touch.' };
  }
}
