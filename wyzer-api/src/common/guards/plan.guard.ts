import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Plan } from '@prisma/client';
import type { Request } from 'express';
import type { AccessTokenPayload } from '../../modules/auth/types/jwt-payload.interface';
import { PLAN_KEY } from '../decorators/required-plan.decorator';

/** Numeric rank for plan comparison. Higher = more permissive. */
const PLAN_RANK: Record<Plan, number> = {
  [Plan.FREE]: 0,
  [Plan.PRO]: 1,
  [Plan.TEAM]: 2,
};

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Plan | undefined>(PLAN_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    // No plan requirement on this route — pass through
    if (!required) return true;

    const req = ctx.switchToHttp().getRequest<Request & { user: AccessTokenPayload }>();
    const userPlan: Plan = req.user?.plan ?? Plan.FREE;

    if (PLAN_RANK[userPlan] < PLAN_RANK[required]) {
      throw new ForbiddenException(
        `This feature requires the ${required} plan. Please upgrade to continue.`,
      );
    }

    return true;
  }
}
