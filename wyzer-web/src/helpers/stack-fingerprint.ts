import type { DeploymentMode, ConfigAnswers, StackItem } from '../api/stacks';

export interface FingerprintInput {
 technologyId: string;
 deploymentMode: DeploymentMode;
 configAnswers: ConfigAnswers;
}

/** Build a stable fingerprint string for a set of stack items.
 *  Two stacks with the same technologies, deployment modes, and config answers
 *  produce the same fingerprint regardless of insertion order. */
export function stackFingerprint(items: FingerprintInput[]): string {
 const normalised = items
  .map((i) => {
   const answers = Object.keys(i.configAnswers)
    .sort()
    .map((k) => `${k}=${i.configAnswers[k]}`)
    .join('|');
   return `${i.technologyId}:${i.deploymentMode}:${answers}`;
  })
  .sort()
  .join('\n');
 return normalised;
}

/** Fingerprint a saved stack (from the API). */
export function fingerprintStackItems(items: StackItem[]): string {
 return stackFingerprint(
  items.map((i) => ({
   technologyId: i.technologyId,
   deploymentMode: i.deploymentMode,
   configAnswers: i.configAnswers,
  })),
 );
}
