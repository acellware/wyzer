import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';

const BLOCKLIST_URL =
  'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/master/disposable_email_blocklist.conf';
const REDIS_KEY = 'disposable:domains';
const CHUNK_SIZE = 1000;

@Injectable()
export class DisposableEmailService implements OnModuleInit {
  private readonly logger = new Logger(DisposableEmailService.name);

  constructor(private readonly redisService: RedisService) {}

  async onModuleInit(): Promise<void> {
    const redis = this.redisService.getClient();

    if (!redis) {
      this.logger.warn('Redis unavailable — disposable email check disabled');
      return;
    }

    try {
      await this.loadBlocklist();
    } catch (err) {
      this.logger.error(
        'Failed to load disposable email blocklist',
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  private async loadBlocklist(): Promise<void> {
    const redis = this.redisService.getClient();
    if (!redis) return;

    const existing = await redis.scard(REDIS_KEY);

    if (existing > 0) {
      this.logger.log(
        `Disposable email blocklist already loaded (${existing} domains)`,
      );
      return;
    }

    this.logger.log('Fetching disposable email blocklist…');

    const response = await fetch(BLOCKLIST_URL);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch blocklist — HTTP ${response.status} ${response.statusText}`,
      );
    }

    const text = await response.text();
    const domains = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'));

    if (domains.length === 0) {
      this.logger.warn('Blocklist response was empty');
      return;
    }

    // Pipeline in chunks to avoid hitting Redis argument count limits
    for (let i = 0; i < domains.length; i += CHUNK_SIZE) {
      await redis.sadd(REDIS_KEY, ...domains.slice(i, i + CHUNK_SIZE));
    }

    this.logger.log(
      `Loaded ${domains.length} disposable email domains into Redis`,
    );
  }

  /**
   * Returns true if the email's domain is found in the disposable blocklist.
   * Always returns false when Redis is unavailable (fail-open).
   */
  async isDisposable(email: string): Promise<boolean> {
    const redis = this.redisService.getClient();
    if (!redis) return false;

    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;

    const isMember = await redis.sismember(REDIS_KEY, domain);
    return isMember === 1;
  }
}
