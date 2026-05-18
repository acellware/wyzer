import { SetMetadata } from '@nestjs/common';
import { Plan } from '@prisma/client';

export const PLAN_KEY = 'plan';
export const PlanRequired = (...plans: Plan[]) => SetMetadata(PLAN_KEY, plans);
