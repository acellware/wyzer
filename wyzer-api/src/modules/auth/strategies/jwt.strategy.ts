import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Env } from '../../../config/env.schema';
import type { AccessTokenPayload } from '../types/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService<Env, true>) {
    const publicKey =
      configService.get('JWT_PUBLIC_KEY', { infer: true })?.replace(/\\n/g, '\n') ?? '';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey || 'DEV_PLACEHOLDER_REPLACE_IN_PROD',
      algorithms: ['RS256'],
    });
  }

  validate(payload: AccessTokenPayload): AccessTokenPayload {
    return payload;
  }
}
