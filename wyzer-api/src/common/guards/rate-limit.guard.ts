import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { RedisService } from '../../common/redis/redis.service';

export interface RateLimitOptions {
  /** Maximum requests allowed within the window. */
  limit: number;
  /** Window duration in seconds. */
  windowSeconds: number;
}

export const RATE_LIMIT_KEY = 'rate_limit';
export const RateLimit = (opts: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, opts);

/**
 * Redis sorted-set sliding-window rate limiter.
 *
 * Key:   `wyzer:rl:{ip}:{routeKey}`
 * Score: epoch milliseconds (used as window boundary)
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const opts = this.reflector.getAllAndOverride<RateLimitOptions | undefined>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!opts) return true; // guard applied globally but handler has no config

    const redis = this.redisService.getClient();
    if (!redis) {
      this.logger.warn('Redis unavailable — rate limiting bypassed');
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const ip =
      (req.headers['x-forwarded-for'] as string | undefined)
        ?.split(',')[0]
        ?.trim() ?? req.socket.remoteAddress ?? 'unknown';

    const routeKey = `${req.method}:${req.path}`;
    const key = `wyzer:rl:${ip}:${routeKey}`;
    const now = Date.now();
    const windowStart = now - opts.windowSeconds * 1000;

    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, '-inf', windowStart);
    pipeline.zadd(key, now, `${now}-${Math.random()}`);
    pipeline.zcard(key);
    pipeline.expire(key, opts.windowSeconds);

    const results = await pipeline.exec();
    const count = (results?.[2]?.[1] as number | null) ?? 0;

    const remaining = Math.max(0, opts.limit - count);
    const resetAt = Math.ceil((now + opts.windowSeconds * 1000) / 1000);

    res.setHeader('X-RateLimit-Limit', opts.limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetAt);

    if (count > opts.limit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'TooManyRequests',
          message: 'Too many requests. Please try again later.',
          details: null,
          requestId:
            (req.headers['x-request-id'] as string | undefined) ?? '',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
