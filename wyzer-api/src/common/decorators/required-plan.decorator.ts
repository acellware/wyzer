import { SetMetadata } from '@nestjs/common';
import { Plan } from '@prisma/client';

export const PLAN_KEY = 'requiredPlan';

/** Marks a route as requiring a minimum plan tier. Apply after @UseGuards(JwtAuthGuard). */
export const RequiredPlan = (plan: Plan) => SetMetadata(PLAN_KEY, plan);
