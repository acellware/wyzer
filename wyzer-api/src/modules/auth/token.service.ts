import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import type { Env } from '../../config/env.schema';
import { RedisService } from '../../common/redis/redis.service';
import type { AccessTokenPayload } from './types/jwt-payload.interface';

function parseDurationToSeconds(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return 604800; // 7d default
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return parseInt(match[1], 10) * (multipliers[match[2]] ?? 1);
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env, true>,
    private readonly redisService: RedisService,
  ) {}

  signAccessToken(payload: AccessTokenPayload): string {
    return this.jwtService.sign(payload);
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return this.jwtService.verify<AccessTokenPayload>(token);
  }

  /**
   * Generates a refresh token, stores its hash in Redis, and returns the raw token.
   */
  async generateRefreshToken(userId: string): Promise<string> {
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const redis = this.redisService.getClient();
    if (redis) {
      const ttl = parseDurationToSeconds(
        this.configService.get('JWT_REFRESH_EXPIRES_IN', { infer: true }),
      );
      await redis.set(`wyzer:refresh:${tokenHash}`, userId, 'EX', ttl);
    } else {
      this.logger.warn('Redis unavailable — refresh token not persisted');
    }

    return rawToken;
  }

  /**
   * Looks up a raw refresh token hash in Redis; returns userId or null if invalid/expired.
   */
  async verifyRefreshToken(rawToken: string): Promise<string | null> {
    const redis = this.redisService.getClient();
    if (!redis) return null;

    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    return redis.get(`wyzer:refresh:${tokenHash}`);
  }

  /** Removes a refresh token from Redis (rotation / logout). */
  async revokeRefreshToken(rawToken: string): Promise<void> {
    const redis = this.redisService.getClient();
    if (!redis) return;

    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    await redis.del(`wyzer:refresh:${tokenHash}`);
  }
}
