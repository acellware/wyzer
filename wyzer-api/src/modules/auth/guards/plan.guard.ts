import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Plan } from '@prisma/client';
import type { Request } from 'express';
import { PLAN_KEY } from '../decorators/plan-required.decorator';
import type { AccessTokenPayload } from '../types/jwt-payload.interface';

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPlans = this.reflector.getAllAndOverride<Plan[]>(PLAN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPlans || requiredPlans.length === 0) return true;

    const req = context
      .switchToHttp()
      .getRequest<Request & { user: AccessTokenPayload }>();

    return requiredPlans.includes(req.user.plan);
  }
}
