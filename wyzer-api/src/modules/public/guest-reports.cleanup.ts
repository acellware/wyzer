import {
 Injectable,
 Logger,
 OnModuleDestroy,
 OnModuleInit,
} from '@nestjs/common';
import { GuestReportsRepository } from './guest-reports.repository';

/**
 * Lightweight daily purge of expired guest reports.
 *
 * Avoids the @nestjs/schedule dependency by using setInterval — adequate for a
 * once-a-day cleanup. In a multi-instance deployment this will run per-instance;
 * deleteMany is idempotent so duplicate runs are harmless.
 */
@Injectable()
export class GuestReportsCleanup implements OnModuleInit, OnModuleDestroy {
 private readonly logger = new Logger(GuestReportsCleanup.name);
 private timer: NodeJS.Timeout | null = null;

 /** Run every 24 hours. */
 private readonly intervalMs = 24 * 60 * 60 * 1000;

 constructor(private readonly repo: GuestReportsRepository) {}

 onModuleInit(): void {
  // Run shortly after boot so a freshly-started instance reclaims space,
  // then on a daily cadence.
  setTimeout(() => void this.run(), 60 * 1000).unref();
  this.timer = setInterval(() => void this.run(), this.intervalMs);
  this.timer.unref();
 }

 onModuleDestroy(): void {
  if (this.timer) {
   clearInterval(this.timer);
   this.timer = null;
  }
 }

 private async run(): Promise<void> {
  try {
   const { count } = await this.repo.purgeExpired();
   if (count > 0) {
    this.logger.log(`Purged ${count} expired guest report(s)`);
   }
  } catch (err) {
   this.logger.error(
    'Failed to purge expired guest reports',
    err instanceof Error ? err.stack : String(err),
   );
  }
 }
}
