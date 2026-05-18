import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { DeploymentMode } from '@prisma/client';
import {
  AssessStackItem,
  ComplianceReport,
  ConfigAnswers,
  ConditionRule,
  ControlConditions,
  ControlResult,
  Gap,
  SatisfiedControl,
  UnverifiedItem,
  SEVERITY_ORDER,
  SEVERITY_WEIGHT,
} from './compliance.types';

@Injectable()
export class ComplianceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Evaluate a single condition rule against the provided answers.
   * Returns 'unverified' if the signal answer is 'not_sure' or missing.
   */
  private evaluateRule(rule: ConditionRule, answers: ConfigAnswers): 'satisfied' | 'violates' | 'unverified' {
    const answer = answers[rule.signal];

    if (answer === undefined || answer === 'not_sure') {
      return 'unverified';
    }

    switch (rule.op) {
      case 'eq':
        return answer === String(rule.value) ? 'satisfied' : 'violates';
      case 'neq':
        return answer !== String(rule.value) ? 'satisfied' : 'violates';
      case 'in': {
        const values = Array.isArray(rule.value) ? rule.value : [String(rule.value)];
        return values.includes(answer) ? 'satisfied' : 'violates';
      }
      case 'not_in': {
        const values = Array.isArray(rule.value) ? rule.value : [String(rule.value)];
        return !values.includes(answer) ? 'satisfied' : 'violates';
      }
      case 'gte':
        return Number(answer) >= Number(rule.value) ? 'satisfied' : 'violates';
      case 'lte':
        return Number(answer) <= Number(rule.value) ? 'satisfied' : 'violates';
      case 'exists':
        return answer !== '' && answer !== null ? 'satisfied' : 'violates';
      default:
        return 'unverified';
    }
  }

  /**
   * Evaluate all conditions for a control mapping against the provided config answers.
   *
   * - If `managed_auto_pass` and technology isManaged → 'satisfied'
   * - AND logic: any 'violates' → 'violates'; any 'unverified' → 'unverified'; else 'satisfied'
   * - OR logic: any 'satisfied' → 'satisfied'; any 'unverified' → 'unverified'; else 'violates'
   */
  evaluateConditions(
    conditions: ControlConditions,
    answers: ConfigAnswers,
    isManaged: boolean,
  ): ControlResult {
    if (conditions.managed_auto_pass && isManaged) {
      return 'satisfied';
    }

    const rules = conditions.rules ?? [];

    if (rules.length === 0) {
      return 'not_applicable';
    }

    const ruleResults = rules.map((r) => this.evaluateRule(r, answers));

    if (conditions.logic === 'AND') {
      if (ruleResults.includes('violates')) return 'violates';
      if (ruleResults.includes('unverified')) return 'unverified';
      return 'satisfied';
    } else {
      // OR
      if (ruleResults.includes('satisfied')) return 'satisfied';
      if (ruleResults.includes('unverified')) return 'unverified';
      return 'violates';
    }
  }

  /**
   * Score a saved stack by ID against the given frameworks.
   */
  async scoreStack(stackId: string, frameworkIds: string[]): Promise<ComplianceReport> {
    const stack = await this.prisma.stack.findUnique({
      where: { id: stackId },
      include: {
        items: { include: { technology: true } },
      },
    });

    if (!stack) {
      return {
        frameworkScores: Object.fromEntries(frameworkIds.map((id) => [id, 0])),
        gaps: [],
        unverified: [],
        satisfiedControls: [],
        generatedAt: new Date(),
      };
    }

    const assessItems: AssessStackItem[] = stack.items.map((item) => ({
      technologyId: item.technologyId,
      deploymentMode: item.deploymentMode,
      configAnswers: (item.configAnswers as ConfigAnswers) ?? {},
    }));

    return this.assess(assessItems, frameworkIds);
  }

  /**
   * Assess a set of stack items against the given frameworks.
   *
   * Algorithm:
   *  1. Load all TechControlMappings for the given technologyIds and frameworkIds.
   *  2. For each mapping, pick the most specific one (matching deploymentMode > null).
   *  3. Evaluate conditions against each item's configAnswers.
   *  4. Per framework, compute a severity-weighted score.
   *  5. Collect gaps (violates/partial), unverified items, and satisfied controls.
   */
  async assess(items: AssessStackItem[], frameworkIds: string[]): Promise<ComplianceReport> {
    if (items.length === 0 || frameworkIds.length === 0) {
      return {
        frameworkScores: Object.fromEntries(frameworkIds.map((id) => [id, 0])),
        gaps: [],
        unverified: [],
        satisfiedControls: [],
        generatedAt: new Date(),
      };
    }

    const technologyIds = items.map((i) => i.technologyId);

    const mappings = await this.prisma.techControlMapping.findMany({
      where: {
        technologyId: { in: technologyIds },
        control: { frameworkId: { in: frameworkIds } },
      },
      include: {
        technology: true,
        control: { include: { framework: true } },
      },
    });

    const techDeploymentMode = new Map<string, DeploymentMode>(
      items.map((i) => [i.technologyId, i.deploymentMode]),
    );
    const techConfigAnswers = new Map<string, ConfigAnswers>(
      items.map((i) => [i.technologyId, i.configAnswers]),
    );

    // Pick most specific mapping per (frameworkId, controlId, technologyId)
    type MappingRecord = typeof mappings[0];
    const bestMapping = new Map<string, MappingRecord>();

    for (const m of mappings) {
      const key = `${m.control.frameworkId}:${m.controlId}:${m.technologyId}`;
      const current = bestMapping.get(key);
      const techMode = techDeploymentMode.get(m.technologyId);
      const isBetter =
        !current ||
        (m.deploymentMode === techMode && current.deploymentMode !== techMode);
      if (isBetter) bestMapping.set(key, m);
    }

    const frameworkData = new Map<
      string,
      { weightedSum: number; totalWeight: number; fw: { id: string; slug: string; name: string } }
    >();
    const gaps: Gap[] = [];
    const unverified: UnverifiedItem[] = [];
    const satisfiedControls: SatisfiedControl[] = [];

    for (const m of bestMapping.values()) {
      const fw = m.control.framework;

      if (!frameworkData.has(fw.id)) {
        frameworkData.set(fw.id, { weightedSum: 0, totalWeight: 0, fw });
      }
      const fd = frameworkData.get(fw.id)!;

      const answers = techConfigAnswers.get(m.technologyId) ?? {};
      const conditions = m.conditions as unknown as ControlConditions;

      const result = this.evaluateConditions(conditions, answers, m.technology.isManaged);

      if (result === 'not_applicable') continue;

      const severityWeight = SEVERITY_WEIGHT[m.control.severity];
      fd.totalWeight += severityWeight;

      switch (result) {
        case 'satisfied':
          fd.weightedSum += severityWeight;
          satisfiedControls.push({
            controlRef: m.control.ref,
            controlTitle: m.control.title,
            frameworkSlug: fw.slug,
            technologyName: m.technology.name,
          });
          break;

        case 'unverified':
          fd.weightedSum += 0;
          unverified.push({
            controlRef: m.control.ref,
            controlTitle: m.control.title,
            frameworkSlug: fw.slug,
            technologyName: m.technology.name,
            remediation: m.remediation,
          });
          break;

        case 'violates':
          fd.weightedSum += 0;
          gaps.push({
            controlRef: m.control.ref,
            controlTitle: m.control.title,
            frameworkSlug: fw.slug,
            frameworkName: fw.name,
            severity: m.control.severity,
            technologyName: m.technology.name,
            remediation: m.remediation,
            isPartial: false,
          });
          break;

        case 'partial':
          fd.weightedSum += severityWeight * 0.5;
          gaps.push({
            controlRef: m.control.ref,
            controlTitle: m.control.title,
            frameworkSlug: fw.slug,
            frameworkName: fw.name,
            severity: m.control.severity,
            technologyName: m.technology.name,
            remediation: m.remediation,
            isPartial: true,
          });
          break;
      }
    }

    const frameworkScores: Record<string, number> = {};
    for (const [, fd] of frameworkData) {
      frameworkScores[fd.fw.id] =
        fd.totalWeight > 0 ? Math.round((fd.weightedSum / fd.totalWeight) * 100) : 0;
    }
    for (const id of frameworkIds) {
      if (!(id in frameworkScores)) frameworkScores[id] = 0;
    }

    gaps.sort(
      (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
    );

    return { frameworkScores, gaps, unverified, satisfiedControls, generatedAt: new Date() };
  }
}

