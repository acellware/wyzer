import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AccessTokenPayload } from '../types/jwt-payload.interface';

export const CurrentUser = createParamDecorator(
  (data: keyof AccessTokenPayload | undefined, ctx: ExecutionContext) => {
    const req = ctx
      .switchToHttp()
      .getRequest<Request & { user: AccessTokenPayload }>();
    return data ? req.user[data] : req.user;
  },
);
