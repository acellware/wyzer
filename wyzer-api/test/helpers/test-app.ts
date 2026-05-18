import { ExecutionContext } from '@nestjs/common';
import { MemberRole, Plan } from '@prisma/client';

export const TEST_ORG_ID = 'test-org-id';
export const TEST_USER_ID = 'test-user-id';

/** Guard override that injects a fake user into req.user for protected routes. */
export const mockJwtGuard = {
  canActivate: (ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Record<string, unknown>>();
    req['user'] = {
      sub: TEST_USER_ID,
      orgId: TEST_ORG_ID,
      role: MemberRole.OWNER,
      plan: Plan.PRO,
    };
    return true;
  },
};
