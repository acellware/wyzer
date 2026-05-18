import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Plan } from '@prisma/client';
import { StacksRepository } from './stacks.repository';
import { CreateStackDto } from './dto/create-stack.dto';
import { UpdateStackDto } from './dto/update-stack.dto';
import { AddStackItemDto } from './dto/add-stack-item.dto';
import { PatchStackItemDto } from './dto/patch-stack-item.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

/** Stack limits per plan tier. */
const STACK_LIMITS: Record<Plan, number> = {
  [Plan.FREE]: 1,
  [Plan.PRO]: 50,
  [Plan.TEAM]: Infinity,
};

@Injectable()
export class StacksService {
  constructor(
    private readonly repo: StacksRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async create(organisationId: string, dto: CreateStackDto, userId?: string, userPlan: Plan = Plan.FREE) {
    // T-047: Enforce plan-based stack creation limits
    const limit = STACK_LIMITS[userPlan];
    const current = await this.repo.countByOrg(organisationId);
    if (current >= limit) {
      throw new ForbiddenException(
        `Your ${userPlan} plan allows a maximum of ${limit} stack${limit === 1 ? '' : 's'}. Upgrade to create more.`,
      );
    }
    const stack = await this.repo.create(organisationId, dto);

    if (dto.templateSlug) {
      const template = await this.repo.findTemplate(dto.templateSlug);
      if (template) {
        const items = (template.templateData as any)?.items ?? [];
        for (const item of items) {
          await this.repo.addItem(stack.id, {
            technologyId: item.technologyId,
            deploymentMode: item.deploymentMode,
            configAnswers: item.configAnswers ?? {},
          });
        }
        const full = await this.repo.findOne(stack.id, organisationId);
        await this.auditLog.record({
          organisationId,
          userId,
          action: 'stack.created',
          resourceType: 'stack',
          resourceId: stack.id,
          metadata: { name: dto.name, templateSlug: dto.templateSlug },
        });
        return full;
      }
    }

    await this.auditLog.record({
      organisationId,
      userId,
      action: 'stack.created',
      resourceType: 'stack',
      resourceId: stack.id,
      metadata: { name: dto.name },
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

  async delete(id: string, organisationId: string) {
    const { count } = await this.repo.delete(id, organisationId);
    if (count === 0) throw new NotFoundException(`Stack '${id}' not found`);
  }

  async addItem(id: string, organisationId: string, dto: AddStackItemDto) {
    await this.findOne(id, organisationId);
    return this.repo.addItem(id, dto);
  }

  async patchItem(id: string, organisationId: string, technologyId: string, dto: PatchStackItemDto) {
    await this.findOne(id, organisationId);
    const { count } = await this.repo.patchItem(id, technologyId, dto);
    if (count === 0) throw new NotFoundException(`Item '${technologyId}' not found in stack '${id}'`);
    return this.findOne(id, organisationId);
  }

  async removeItem(id: string, organisationId: string, technologyId: string) {
    await this.findOne(id, organisationId);
    await this.repo.removeItem(id, technologyId);
  }
}
