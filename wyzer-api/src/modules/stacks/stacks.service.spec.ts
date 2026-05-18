import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Plan } from '@prisma/client';
import { mock } from 'jest-mock-extended';
import { StacksRepository } from './stacks.repository';
import { AuditLogService } from '../audit-log/audit-log.service';
import { StacksService } from './stacks.service';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const ORG_ID = 'org-1';
const USER_ID = 'user-1';
const STACK_ID = 'stack-1';

function makeStack(overrides = {}) {
  return {
    id: STACK_ID,
    organisationId: ORG_ID,
    name: 'Test Stack',
    description: null,
    dataScopes: [],
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('StacksService', () => {
  let service: StacksService;
  let repo: ReturnType<typeof mock<StacksRepository>>;
  let auditLog: ReturnType<typeof mock<AuditLogService>>;

  beforeEach(() => {
    repo = mock<StacksRepository>();
    auditLog = mock<AuditLogService>();
    auditLog.record.mockResolvedValue(undefined as never);
    service = new StacksService(repo, auditLog);
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('throws ForbiddenException when FREE plan stack limit is reached', async () => {
      repo.countByOrg.mockResolvedValue(1); // already has 1 stack → limit hit

      await expect(
        service.create(ORG_ID, { name: 'New Stack' }, USER_ID, Plan.FREE),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows PRO plan to create up to 50 stacks', async () => {
      repo.countByOrg.mockResolvedValue(49);
      repo.create.mockResolvedValue(makeStack() as never);

      const result = await service.create(ORG_ID, { name: 'Stack 50' }, USER_ID, Plan.PRO);

      expect(repo.create).toHaveBeenCalledWith(ORG_ID, { name: 'Stack 50' });
      expect(result!.id).toBe(STACK_ID);
    });

    it('throws ForbiddenException when PRO plan limit of 50 is reached', async () => {
      repo.countByOrg.mockResolvedValue(50);

      await expect(
        service.create(ORG_ID, { name: 'Stack 51' }, USER_ID, Plan.PRO),
      ).rejects.toThrow(ForbiddenException);
    });

    it('creates a stack and records an audit log entry', async () => {
      repo.countByOrg.mockResolvedValue(0);
      const stack = makeStack();
      repo.create.mockResolvedValue(stack as never);

      const result = await service.create(ORG_ID, { name: 'My Stack' }, USER_ID, Plan.FREE);

      expect(repo.create).toHaveBeenCalledTimes(1);
      expect(auditLog.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'stack.created', resourceId: STACK_ID }),
      );
      expect(result!.name).toBe('Test Stack');
    });

    it('applies template items when templateSlug is provided', async () => {
      repo.countByOrg.mockResolvedValue(0);
      const stack = makeStack();
      repo.create.mockResolvedValue(stack as never);

      const templateData = {
        items: [
          { technologyId: 'tech-pg', deploymentMode: 'MANAGED', configAnswers: { tls: 'yes' } },
        ],
      };
      repo.findTemplate.mockResolvedValue({ id: 'tmpl-1', templateData } as never);
      repo.addItem.mockResolvedValue(undefined as never);
      repo.findOne.mockResolvedValue(stack as never);

      const result = await service.create(
        ORG_ID,
        { name: 'From Template', templateSlug: 'startup-stack' },
        USER_ID,
        Plan.PRO,
      );

      expect(repo.findTemplate).toHaveBeenCalledWith('startup-stack');
      expect(repo.addItem).toHaveBeenCalledTimes(1);
      expect(result).toEqual(stack);
    });
  });

  // ── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('delegates to repo.findAllByOrg', () => {
      repo.findAllByOrg.mockResolvedValue([] as never);
      service.findAll(ORG_ID);
      expect(repo.findAllByOrg).toHaveBeenCalledWith(ORG_ID);
    });
  });

  // ── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('throws NotFoundException when stack does not exist', async () => {
      repo.findOne.mockResolvedValue(null as never);

      await expect(service.findOne('nonexistent', ORG_ID)).rejects.toThrow(NotFoundException);
    });

    it('returns stack when found', async () => {
      const stack = makeStack();
      repo.findOne.mockResolvedValue(stack as never);

      const result = await service.findOne(STACK_ID, ORG_ID);
      expect(result).toEqual(stack);
    });
  });

  // ── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('throws NotFoundException when no row was updated', async () => {
      repo.update.mockResolvedValue({ count: 0 } as never);

      await expect(
        service.update('nonexistent', ORG_ID, { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns updated stack on success', async () => {
      const stack = makeStack({ name: 'New Name' });
      repo.update.mockResolvedValue({ count: 1 } as never);
      repo.findOne.mockResolvedValue(stack as never);

      const result = await service.update(STACK_ID, ORG_ID, { name: 'New Name' });
      expect(result.name).toBe('New Name');
    });
  });

  // ── delete ────────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('throws NotFoundException when no row was deleted', async () => {
      repo.delete.mockResolvedValue({ count: 0 } as never);

      await expect(service.delete('nonexistent', ORG_ID)).rejects.toThrow(NotFoundException);
    });

    it('resolves without error on successful delete', async () => {
      repo.delete.mockResolvedValue({ count: 1 } as never);

      await expect(service.delete(STACK_ID, ORG_ID)).resolves.toBeUndefined();
    });
  });

  // ── addItem ───────────────────────────────────────────────────────────────

  describe('addItem', () => {
    it('throws NotFoundException when stack not found before adding item', async () => {
      repo.findOne.mockResolvedValue(null as never);

      await expect(
        service.addItem(STACK_ID, ORG_ID, { technologyId: 'tech-1', deploymentMode: 'MANAGED' } as never),
      ).rejects.toThrow(NotFoundException);
    });

    it('adds item when stack exists', async () => {
      repo.findOne.mockResolvedValue(makeStack() as never);
      repo.addItem.mockResolvedValue({ id: 'item-1' } as never);

      const result = await service.addItem(
        STACK_ID,
        ORG_ID,
        { technologyId: 'tech-1', deploymentMode: 'MANAGED' } as never,
      );
      expect(repo.addItem).toHaveBeenCalledWith(STACK_ID, expect.any(Object));
      expect(result).toEqual({ id: 'item-1' });
    });
  });

  // ── patchItem ─────────────────────────────────────────────────────────────

  describe('patchItem', () => {
    it('throws NotFoundException when item not found in stack', async () => {
      repo.findOne.mockResolvedValue(makeStack() as never);
      repo.patchItem.mockResolvedValue({ count: 0 } as never);

      await expect(
        service.patchItem(STACK_ID, ORG_ID, 'tech-missing', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── removeItem ────────────────────────────────────────────────────────────

  describe('removeItem', () => {
    it('calls repo.removeItem after validating stack ownership', async () => {
      repo.findOne.mockResolvedValue(makeStack() as never);
      repo.removeItem.mockResolvedValue(undefined as never);

      await service.removeItem(STACK_ID, ORG_ID, 'tech-1');

      expect(repo.removeItem).toHaveBeenCalledWith(STACK_ID, 'tech-1');
    });
  });
});
