import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailService, SendVerificationPayload } from './email.service';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<SendVerificationPayload>): Promise<void> {
    this.logger.debug(`Processing email job: ${job.name} [id=${job.id}]`);

    if (job.name === 'send-verification') {
      const { to, firstName, verificationUrl } = job.data;
      await this.emailService.sendVerificationEmail(to, firstName, verificationUrl);
    }
  }
}
