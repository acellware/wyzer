import { DeploymentMode, Severity } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { PrismaService } from '@common/prisma/prisma.service';
import { ComplianceService } from './compliance.service';
import type { ControlConditions, AssessStackItem } from './compliance.types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeConditions(overrides: Partial<ControlConditions> = {}): ControlConditions {
  return {
    logic: 'AND',
    managed_auto_pass: false,
    rules: [],
    ...overrides,
  };
}

// ─── ComplianceService.evaluateConditions ─────────────────────────────────────

describe('ComplianceService', () => {
  let service: ComplianceService;
  let prisma: ReturnType<typeof mockDeep<PrismaService>>;

  beforeEach(() => {
    prisma = mockDeep<PrismaService>();
    service = new ComplianceService(prisma);
  });

  // ── evaluateConditions ────────────────────────────────────────────────────

  describe('evaluateConditions', () => {
    it('returns satisfied when managed_auto_pass is true and isManaged is true', () => {
      const conditions = makeConditions({
        managed_auto_pass: true,
        rules: [{ signal: 'encryption_at_rest', op: 'eq', value: 'yes' }],
      });
      expect(service.evaluateConditions(conditions, {}, true)).toBe('satisfied');
    });

    it('does NOT auto-pass when managed_auto_pass is true but isManaged is false', () => {
      const conditions = makeConditions({
        managed_auto_pass: true,
        rules: [{ signal: 'encryption_at_rest', op: 'eq', value: 'yes' }],
      });
      // no answer → unverified
      expect(service.evaluateConditions(conditions, {}, false)).toBe('unverified');
    });

    it('returns not_applicable when rules list is empty', () => {
      const conditions = makeConditions({ rules: [] });
      expect(service.evaluateConditions(conditions, {}, false)).toBe('not_applicable');
    });

    describe('AND logic', () => {
      it('returns satisfied when all rules are satisfied', () => {
        const conditions = makeConditions({
          logic: 'AND',
          rules: [
            { signal: 'tls', op: 'eq', value: 'yes' },
            { signal: 'public', op: 'eq', value: 'no' },
          ],
        });
        expect(service.evaluateConditions(conditions, { tls: 'yes', public: 'no' }, false)).toBe('satisfied');
      });

      it('returns violates when any rule violates', () => {
        const conditions = makeConditions({
          logic: 'AND',
          rules: [
            { signal: 'tls', op: 'eq', value: 'yes' },
            { signal: 'public', op: 'eq', value: 'no' },
          ],
        });
        expect(service.evaluateConditions(conditions, { tls: 'yes', public: 'yes' }, false)).toBe('violates');
      });

      it('returns unverified when any rule is unverified and none violate', () => {
        const conditions = makeConditions({
          logic: 'AND',
          rules: [
            { signal: 'tls', op: 'eq', value: 'yes' },
            { signal: 'backup', op: 'eq', value: 'yes' },
          ],
        });
        expect(service.evaluateConditions(conditions, { tls: 'yes' }, false)).toBe('unverified');
      });

      it('violates takes precedence over unverified in AND', () => {
        const conditions = makeConditions({
          logic: 'AND',
          rules: [
            { signal: 'tls', op: 'eq', value: 'yes' },
            { signal: 'auth', op: 'eq', value: 'yes' },
            { signal: 'public', op: 'eq', value: 'no' },
          ],
        });
        // tls missing (unverified), public violated
        expect(service.evaluateConditions(conditions, { auth: 'yes', public: 'yes' }, false)).toBe('violates');
      });
    });

    describe('OR logic', () => {
      it('returns satisfied when any rule is satisfied', () => {
        const conditions = makeConditions({
          logic: 'OR',
          rules: [
            { signal: 'tls', op: 'eq', value: 'yes' },
            { signal: 'auth', op: 'eq', value: 'yes' },
          ],
        });
        expect(service.evaluateConditions(conditions, { tls: 'no', auth: 'yes' }, false)).toBe('satisfied');
      });

      it('returns violates when all rules violate', () => {
        const conditions = makeConditions({
          logic: 'OR',
          rules: [
            { signal: 'tls', op: 'eq', value: 'yes' },
            { signal: 'auth', op: 'eq', value: 'yes' },
          ],
        });
        expect(service.evaluateConditions(conditions, { tls: 'no', auth: 'no' }, false)).toBe('violates');
      });

      it('returns unverified when no satisfied but at least one unverified', () => {
        const conditions = makeConditions({
          logic: 'OR',
          rules: [
            { signal: 'tls', op: 'eq', value: 'yes' },
            { signal: 'auth', op: 'eq', value: 'yes' },
          ],
        });
        expect(service.evaluateConditions(conditions, { tls: 'no' }, false)).toBe('unverified');
      });
    });

    describe('rule operators', () => {
      it('eq: match → satisfied', () => {
        const c = makeConditions({ rules: [{ signal: 's', op: 'eq', value: 'yes' }] });
        expect(service.evaluateConditions(c, { s: 'yes' }, false)).toBe('satisfied');
      });

      it('eq: no match → violates', () => {
        const c = makeConditions({ rules: [{ signal: 's', op: 'eq', value: 'yes' }] });
        expect(service.evaluateConditions(c, { s: 'no' }, false)).toBe('violates');
      });

      it('neq: match → satisfied', () => {
        const c = makeConditions({ rules: [{ signal: 's', op: 'neq', value: 'no' }] });
        expect(service.evaluateConditions(c, { s: 'yes' }, false)).toBe('satisfied');
      });

      it('in: value in array → satisfied', () => {
        const c = makeConditions({ rules: [{ signal: 's', op: 'in', value: ['7_30d', 'gt_90d'] }] });
        expect(service.evaluateConditions(c, { s: '7_30d' }, false)).toBe('satisfied');
      });

      it('in: value not in array → violates', () => {
        const c = makeConditions({ rules: [{ signal: 's', op: 'in', value: ['7_30d', 'gt_90d'] }] });
        expect(service.evaluateConditions(c, { s: 'lt_7d' }, false)).toBe('violates');
      });

      it('not_in: value not in array → satisfied', () => {
        const c = makeConditions({ rules: [{ signal: 's', op: 'not_in', value: ['none', 'n/a'] }] });
        expect(service.evaluateConditions(c, { s: 'vault' }, false)).toBe('satisfied');
      });

      it('gte: number ≥ value → satisfied', () => {
        const c = makeConditions({ rules: [{ signal: 'days', op: 'gte', value: '7' }] });
        expect(service.evaluateConditions(c, { days: '30' }, false)).toBe('satisfied');
      });

      it('gte: number < value → violates', () => {
        const c = makeConditions({ rules: [{ signal: 'days', op: 'gte', value: '7' }] });
        expect(service.evaluateConditions(c, { days: '3' }, false)).toBe('violates');
      });

      it('lte: number ≤ value → satisfied', () => {
        const c = makeConditions({ rules: [{ signal: 'days', op: 'lte', value: '90' }] });
        expect(service.evaluateConditions(c, { days: '30' }, false)).toBe('satisfied');
      });

      it('exists: non-empty → satisfied', () => {
        const c = makeConditions({ rules: [{ signal: 's', op: 'exists', value: '' }] });
        expect(service.evaluateConditions(c, { s: 'vault/secret' }, false)).toBe('satisfied');
      });

      it('undefined signal → unverified', () => {
        const c = makeConditions({ rules: [{ signal: 'missing', op: 'eq', value: 'yes' }] });
        expect(service.evaluateConditions(c, {}, false)).toBe('unverified');
      });

      it('not_sure answer → unverified', () => {
        const c = makeConditions({ rules: [{ signal: 'tls', op: 'eq', value: 'yes' }] });
        expect(service.evaluateConditions(c, { tls: 'not_sure' }, false)).toBe('unverified');
      });
    });
  });

  // ── assess ────────────────────────────────────────────────────────────────

  describe('assess', () => {
    it('returns empty report when items is empty', async () => {
      const report = await service.assess([], ['fw-1', 'fw-2']);
      expect(report.gaps).toHaveLength(0);
      expect(report.satisfiedControls).toHaveLength(0);
      expect(report.frameworkScores).toEqual({ 'fw-1': 0, 'fw-2': 0 });
    });

    it('returns empty report when frameworkIds is empty', async () => {
      const items: AssessStackItem[] = [
        { technologyId: 'tech-1', deploymentMode: DeploymentMode.MANAGED, configAnswers: {} },
      ];
      const report = await service.assess(items, []);
      expect(report.gaps).toHaveLength(0);
    });

    it('records a gap when a rule is violated', async () => {
      const fw = { id: 'fw-soc2', slug: 'soc2', name: 'SOC 2' };
      const control = { id: 'cc6-1', ref: 'CC6.1', title: 'Logical Access', severity: Severity.HIGH, frameworkId: 'fw-soc2', framework: fw };
      const tech = { id: 'tech-pg', name: 'PostgreSQL', isManaged: false };

      (prisma.techControlMapping.findMany as jest.Mock).mockResolvedValueOnce([
        {
          technologyId: 'tech-pg',
          controlId: 'cc6-1',
          deploymentMode: null,
          technology: tech,
          control,
          conditions: {
            logic: 'AND',
            managed_auto_pass: false,
            rules: [{ signal: 'tls_enforced', op: 'eq', value: 'yes' }],
          },
          evidence: null,
          remediation: 'Enable TLS',
        },
      ]);

      const items: AssessStackItem[] = [
        { technologyId: 'tech-pg', deploymentMode: DeploymentMode.SELF_HOSTED, configAnswers: { tls_enforced: 'no' } },
      ];

      const report = await service.assess(items, ['fw-soc2']);

      expect(report.gaps).toHaveLength(1);
      expect(report.gaps[0].controlRef).toBe('CC6.1');
      expect(report.gaps[0].frameworkSlug).toBe('soc2');
      expect(report.satisfiedControls).toHaveLength(0);
      expect(report.frameworkScores['fw-soc2']).toBe(0);
    });

    it('records a satisfied control and scores 100% when all rules pass', async () => {
      const fw = { id: 'fw-soc2', slug: 'soc2', name: 'SOC 2' };
      const control = { id: 'cc6-1', ref: 'CC6.1', title: 'Logical Access', severity: Severity.HIGH, frameworkId: 'fw-soc2', framework: fw };
      const tech = { id: 'tech-pg', name: 'PostgreSQL', isManaged: false };

      (prisma.techControlMapping.findMany as jest.Mock).mockResolvedValueOnce([
        {
          technologyId: 'tech-pg',
          controlId: 'cc6-1',
          deploymentMode: null,
          technology: tech,
          control,
          conditions: {
            logic: 'AND',
            managed_auto_pass: false,
            rules: [{ signal: 'tls_enforced', op: 'eq', value: 'yes' }],
          },
          evidence: null,
          remediation: null,
        },
      ]);

      const items: AssessStackItem[] = [
        { technologyId: 'tech-pg', deploymentMode: DeploymentMode.SELF_HOSTED, configAnswers: { tls_enforced: 'yes' } },
      ];

      const report = await service.assess(items, ['fw-soc2']);

      expect(report.satisfiedControls).toHaveLength(1);
      expect(report.gaps).toHaveLength(0);
      expect(report.frameworkScores['fw-soc2']).toBe(100);
    });

    it('records an unverified item when signal answer is missing', async () => {
      const fw = { id: 'fw-soc2', slug: 'soc2', name: 'SOC 2' };
      const control = { id: 'cc6-2', ref: 'CC6.2', title: 'Backup', severity: Severity.MEDIUM, frameworkId: 'fw-soc2', framework: fw };
      const tech = { id: 'tech-pg', name: 'PostgreSQL', isManaged: false };

      (prisma.techControlMapping.findMany as jest.Mock).mockResolvedValueOnce([
        {
          technologyId: 'tech-pg',
          controlId: 'cc6-2',
          deploymentMode: null,
          technology: tech,
          control,
          conditions: {
            logic: 'AND',
            managed_auto_pass: false,
            rules: [{ signal: 'backup_enabled', op: 'eq', value: 'yes' }],
          },
          evidence: null,
          remediation: null,
        },
      ]);

      const items: AssessStackItem[] = [
        { technologyId: 'tech-pg', deploymentMode: DeploymentMode.SELF_HOSTED, configAnswers: {} },
      ];

      const report = await service.assess(items, ['fw-soc2']);

      expect(report.unverified).toHaveLength(1);
      expect(report.gaps).toHaveLength(0);
    });

    it('auto-passes managed control when managed_auto_pass is true', async () => {
      const fw = { id: 'fw-soc2', slug: 'soc2', name: 'SOC 2' };
      const control = { id: 'cc6-1', ref: 'CC6.1', title: 'Encryption', severity: Severity.CRITICAL, frameworkId: 'fw-soc2', framework: fw };
      const tech = { id: 'tech-rds', name: 'RDS', isManaged: true };

      (prisma.techControlMapping.findMany as jest.Mock).mockResolvedValueOnce([
        {
          technologyId: 'tech-rds',
          controlId: 'cc6-1',
          deploymentMode: null,
          technology: tech,
          control,
          conditions: {
            logic: 'AND',
            managed_auto_pass: true,
            rules: [{ signal: 'encryption_at_rest', op: 'eq', value: 'yes' }],
          },
          evidence: null,
          remediation: null,
        },
      ]);

      const items: AssessStackItem[] = [
        { technologyId: 'tech-rds', deploymentMode: DeploymentMode.MANAGED, configAnswers: {} },
      ];

      const report = await service.assess(items, ['fw-soc2']);

      expect(report.satisfiedControls).toHaveLength(1);
      expect(report.gaps).toHaveLength(0);
      expect(report.frameworkScores['fw-soc2']).toBe(100);
    });
  });
});
