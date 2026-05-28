import type { ComplianceResult } from '../api/reports';
import type { Framework } from '../api/frameworks';

export function avgScore(result: ComplianceResult | null): number | null {
 if (!result) return null;
 const vals = Object.values(result.frameworkScores);
 if (!vals.length) return null;
 return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

/** Build a human-readable label of frameworks in a report.
 *  Uses the frameworks lookup to map IDs → names; falls back to gap names. */
export function frameworkLabel(
 result: ComplianceResult | null,
 frameworks: Framework[] = [],
): string {
 if (!result) return '';
 const ids = Object.keys(result.frameworkScores);
 if (ids.length) {
  const byId = new Map(frameworks.map((f) => [f.id, f.name]));
  const names = ids.map((id) => byId.get(id)).filter((n): n is string => !!n);
  if (names.length) return names.join(', ');
 }
 // fallback to names captured in gaps
 const gapNames = [...new Set(result.gaps.map((g) => g.frameworkName))];
 if (gapNames.length) return gapNames.join(', ');
 return '';
}
