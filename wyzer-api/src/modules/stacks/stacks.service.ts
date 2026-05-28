import {
 ForbiddenException,
 Injectable,
 NotFoundException,
} from '@nestjs/common';
import { Plan } from '@prisma/client';
import { StacksRepository } from './stacks.repository';
import { CreateStackDto } from './dto/create-stack.dto';
import { UpdateStackDto } from './dto/update-stack.dto';
import { AddStackItemDto } from './dto/add-stack-item.dto';
import { PatchStackItemDto } from './dto/patch-stack-item.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

/** Stack limits per plan tier. */
const STACK_LIMITS: Record<Plan, number> = {
 [Plan.FREE]: Infinity,
 [Plan.PRO]: Infinity,
 [Plan.TEAM]: Infinity,
};

@Injectable()
export class StacksService {
 constructor(
  private readonly repo: StacksRepository,
  private readonly auditLog: AuditLogService,
 ) {}

 async create(
  organisationId: string,
  dto: CreateStackDto,
  userId?: string,
  userPlan: Plan = Plan.FREE,
 ) {
  // T-047: Enforce plan-based stack creation limits
  const limit = STACK_LIMITS[userPlan];
  const current = await this.repo.countByOrg(organisationId);
  if (current >= limit) {
   throw new ForbiddenException(
    `Your ${userPlan} plan allows a maximum of ${limit} stack${limit === 1 ? '' : 's'}. Upgrade to create more.`,
   );
  }
  const stack = await this.repo.create(organisationId, dto);

  await this.auditLog.record({
   organisationId,
   userId,
   action: 'stack.created',
   resourceType: 'stack',
   resourceId: stack.id,
   metadata: {
    name: dto.name,
    ...(dto.templateSlug && { templateSlug: dto.templateSlug }),
   },
  });

  return stack;
 }

 findAll(organisationId: string) {
  return this.repo.findAllByOrg(organisationId);
 }

 async findOne(id: string, organisationId: string) {
  const stack = await this.repo.findOne(id, organisationId);
  if (!stack) throw new NotFoundException(`Stack '${id}' not found`);
  return stack;
 }

 async update(id: string, organisationId: string, dto: UpdateStackDto) {
  const { count } = await this.repo.update(id, organisationId, dto);
  if (count === 0) throw new NotFoundException(`Stack '${id}' not found`);
  return this.findOne(id, organisationId);
 }

 /** Delete a stack and all associated data (items, reports, etc — handled by
  *  DB-level `ON DELETE CASCADE`). Records an audit log entry capturing a
  *  snapshot of the stack so we retain a trace for analytics/recovery after
  *  the row is gone. */
 async delete(id: string, organisationId: string, userId?: string) {
  // Snapshot before delete so the audit log preserves analytics info.
  const stack = await this.repo.findOne(id, organisationId);
  if (!stack) throw new NotFoundException(`Stack '${id}' not found`);

  const reportCount = await this.repo.countReports(id);

  const { count } = await this.repo.delete(id, organisationId);
  if (count === 0) throw new NotFoundException(`Stack '${id}' not found`);

  await this.auditLog.record({
   organisationId,
   userId,
   action: 'stack.deleted',
   resourceType: 'stack',
   resourceId: id,
   metadata: {
    name: stack.name,
    description: stack.description ?? undefined,
    dataScopes: stack.dataScopes,
    itemCount: stack.items.length,
    technologies: stack.items.map((i) => ({
     technologyId: i.technologyId,
     deploymentMode: i.deploymentMode,
    })),
    reportCount,
   },
  });
 }

 async addItem(id: string, organisationId: string, dto: AddStackItemDto) {
  await this.findOne(id, organisationId);
  return this.repo.addItem(id, dto);
 }

 async patchItem(
  id: string,
  organisationId: string,
  technologyId: string,
  dto: PatchStackItemDto,
 ) {
  await this.findOne(id, organisationId);
  const { count } = await this.repo.patchItem(id, technologyId, dto);
  if (count === 0)
   throw new NotFoundException(
    `Item '${technologyId}' not found in stack '${id}'`,
   );
  return this.findOne(id, organisationId);
 }

 async removeItem(id: string, organisationId: string, technologyId: string) {
  await this.findOne(id, organisationId);
  await this.repo.removeItem(id, technologyId);
 }
}
