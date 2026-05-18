import { Severity, DeploymentMode } from '@prisma/client';

// ─── Condition evaluation types (aligned with YAML/DB conditions Json field) ─────

export interface ConditionRule {
  signal: string;
  op: 'eq' | 'neq' | 'in' | 'not_in' | 'gte' | 'lte' | 'exists';
  value: string | string[];
}

export interface ControlConditions {
  logic: 'AND' | 'OR';
  managed_auto_pass: boolean;
  rules: ConditionRule[];
}

export type ControlResult = 'satisfied' | 'partial' | 'violates' | 'unverified' | 'not_applicable';

export type ConfigAnswers = Record<string, string>;

// ─── Input types ─────────────────────────────────────────────────────────────────

export interface AssessStackItem {
  technologyId: string;
  deploymentMode: DeploymentMode;
  configAnswers: ConfigAnswers;
}

// ─── Report output types ──────────────────────────────────────────────────────────

export interface Gap {
  controlRef: string;
  controlTitle: string;
  frameworkSlug: string;
  frameworkName: string;
  severity: Severity;
  technologyName: string;
  failedSignal?: string;
  remediation?: string | null;
  isPartial: boolean;
}

export interface UnverifiedItem {
  controlRef: string;
  controlTitle: string;
  frameworkSlug: string;
  technologyName: string;
  signalKey?: string;
  remediation?: string | null;
}

export interface SatisfiedControl {
  controlRef: string;
  controlTitle: string;
  frameworkSlug: string;
  technologyName: string;
}

export interface ComplianceReport {
  /** Score per frameworkId (0–100) */
  frameworkScores: Record<string, number>;
  /** Gaps sorted by severity descending */
  gaps: Gap[];
  unverified: UnverifiedItem[];
  satisfiedControls: SatisfiedControl[];
  generatedAt: Date;
}

// ─── Scoring helpers ──────────────────────────────────────────────────────────────

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  [Severity.CRITICAL]: 4,
  [Severity.HIGH]: 3,
  [Severity.MEDIUM]: 2,
  [Severity.LOW]: 1,
};

export const SEVERITY_ORDER: Severity[] = [
  Severity.CRITICAL,
  Severity.HIGH,
  Severity.MEDIUM,
  Severity.LOW,
];

