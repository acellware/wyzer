import { MemberRole, Plan } from '@prisma/client';

export interface AccessTokenPayload {
  sub: string;
  orgId: string;
  role: MemberRole;
  plan: Plan;
  iat?: number;
  exp?: number;
}
