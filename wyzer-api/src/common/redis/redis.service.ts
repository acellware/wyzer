import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type { Env } from '../../config/env.schema';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;

  constructor(private readonly configService: ConfigService<Env, true>) {}

  async onModuleInit(): Promise<void> {
    const redisUrl = this.configService.get('REDIS_URL', { infer: true });

    if (!redisUrl) {
      this.logger.warn('REDIS_URL not configured — Redis features disabled');
      return;
    }

    this.client = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    this.client.on('error', (err: Error) => {
      this.logger.error('Redis client error', err.message);
    });

    try {
      await this.client.connect();
      this.logger.log('Redis connected');
    } catch (err) {
      this.logger.error(
        'Redis initial connection failed',
        err instanceof Error ? err.message : String(err),
      );
      this.client = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }

  getClient(): Redis | null {
    return this.client;
  }

  isConnected(): boolean {
    return this.client !== null && this.client.status === 'ready';
  }
}
