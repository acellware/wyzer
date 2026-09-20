// Content integrity check for the Compliance Navigator.
// Runs automatically on every push (root husky pre-push hook) and manually:
//   npm run content:check   (from wyzer-web)
//   npm run check:content   (from the repo root)
// Exits 1 if any checklist item fails. Mirrors src/content/config.ts (zod)
// with friendlier errors, plus checks the build does not cover.

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as yamlParse } from 'yaml';

const contentDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content');
const errors = [];
const pass = [];

const rel = (p) => p.replace(process.cwd() + '/', '');
const readYaml = (p) => {
  try {
    return yamlParse(readFileSync(p, 'utf8'));
  } catch (e) {
    errors.push(`YAML parse: ${rel(p)}: ${e.message}`);
    return null;
  }
};
const slugOk = (s) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s);

// 1. Framework set: YAML files must match the FRAMEWORK enum in config.ts.
const fwFiles = readdirSync(join(contentDir, 'frameworks'))
  .filter((f) => f.endsWith('.yaml'))
  .map((f) => f.replace(/\.yaml$/, ''))
  .sort();
const cfg = readFileSync(join(contentDir, 'config.ts'), 'utf8');
const enumMatch = cfg.match(/export const FRAMEWORK = z\.enum\(\[([^\]]*)\]\)/);
if (!enumMatch) errors.push('config.ts: could not find the FRAMEWORK z.enum block');
const fwEnum = (enumMatch ? enumMatch[1].match(/'([^']+)'/g) : []).map((s) => s.replaceAll("'", '')).sort();
for (const f of [...fwFiles, ...fwEnum]) {
  if (!fwFiles.includes(f)) errors.push(`frameworks/: YAML file missing for framework "${f}"`);
  if (!fwEnum.includes(f)) errors.push(`config.ts: FRAMEWORK enum missing "${f}" (frameworks/${f}.yaml exists)`);
}
for (const f of fwFiles) {
  const d = readYaml(join(contentDir, 'frameworks', `${f}.yaml`));
  if (!d) continue;
  for (const k of ['name', 'shortName', 'badgeColor', 'sourceUrl', 'blurb']) {
    if (typeof d[k] !== 'string' || !d[k].trim()) errors.push(`frameworks/${f}.yaml: missing field "${k}"`);
  }
  if (typeof d.order !== 'number') errors.push(`frameworks/${f}.yaml: missing numeric "order"`);
  if (!slugOk(f)) errors.push(`frameworks/${f}.yaml: slug should be lowercase-hyphenated ("${f}")`);
}
if (!errors.length) pass.push(`frameworks: ${fwFiles.length} frameworks, fields + enum in sync`);

// 2. Topics: frontmatter + cards.
const topics = readdirSync(join(contentDir, 'topics'))
  .filter((f) => f.endsWith('.mdx'))
  .map((f) => f.replace(/\.mdx$/, ''));
for (const slug of topics) {
  const p = join(contentDir, 'topics', `${slug}.mdx`);
  const raw = readFileSync(p, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) {
    errors.push(`topics/${slug}.mdx: missing frontmatter block`);
    continue;
  }
  let fm;
  try {
    fm = yamlParse(m[1]);
  } catch (e) {
    errors.push(`topics/${slug}.mdx: frontmatter parse: ${e.message}`);
    continue;
  }
  if (!slugOk(slug)) errors.push(`topics/${slug}.mdx: slug should be lowercase-hyphenated`);
  if (typeof fm.name !== 'string' || !fm.name.trim()) errors.push(`topics/${slug}.mdx: missing "name"`);
  if (!['resource-linked', 'industry-only'].includes(fm.type)) {
    errors.push(`topics/${slug}.mdx: "type" must be resource-linked or industry-only`);
  }
  if (typeof fm.summary !== 'string' || !fm.summary.trim()) {
    errors.push(`topics/${slug}.mdx: missing "summary"`);
  } else if (fm.summary.length > 320) {
    errors.push(`topics/${slug}.mdx: "summary" is ${fm.summary.length} chars (max 320)`);
  }
  if (!Array.isArray(fm.cards) || fm.cards.length === 0) {
    errors.push(`topics/${slug}.mdx: need at least 1 card`);
  } else {
    for (const [i, c] of fm.cards.entries()) {
      const where = `topics/${slug}.mdx cards[${i}]`;
      if (!fwEnum.includes(c.framework)) errors.push(`${where}: unknown framework "${c.framework}"`);
      if (typeof c.plain !== 'string' || !c.plain.trim()) errors.push(`${where}: missing "plain"`);
      if (c.detail !== undefined && (typeof c.detail !== 'string' || !c.detail.trim())) {
        errors.push(`${where}: "detail" must be non-empty`);
      }
      if (c.citations !== undefined) {
        if (!Array.isArray(c.citations) || c.citations.length === 0) {
          errors.push(`${where}: "citations" must be a non-empty array`);
        } else {
          for (const [j, ct] of c.citations.entries()) {
            if (typeof ct.label !== 'string' || !ct.label.trim()) errors.push(`${where} citations[${j}]: missing "label"`);
            if (ct.url !== undefined && typeof ct.url !== 'string') errors.push(`${where} citations[${j}]: "url" must be a string`);
          }
        }
      }
    }
  }
}
const dupes = topics.filter((s, i) => topics.indexOf(s) !== i);
if (dupes.length) errors.push(`topics/: duplicate slugs: ${dupes.join(', ')}`);
if (!errors.length) pass.push(`topics: ${topics.length} topics, frontmatter + cards valid`);

// 3. Tree cross-references: every topic: slug must exist; every topic must be
//    reachable from at least one tree (cloud configuration or industry function).
const refs = [];
const scan = (node, path) => {
  if (node && typeof node === 'object') {
    if (typeof node.topic === 'string') refs.push({ slug: node.topic, from: path });
    for (const [k, v] of Object.entries(node)) {
      if (Array.isArray(v)) v.forEach((item, i) => scan(item, `${path}.${k}[${i}]`));
    }
  }
};
for (const dir of ['cloud', 'industry']) {
  for (const f of readdirSync(join(contentDir, dir)).filter((x) => x.endsWith('.yaml'))) {
    const d = readYaml(join(contentDir, dir, f));
    if (d) scan(d, `${dir}/${f}`);
  }
}
const missing = [...new Set(refs.filter((r) => !topics.includes(r.slug)).map((r) => `${r.slug} (${r.from})`))];
if (missing.length) errors.push(`topic references to non-existent topics: ${missing.join(', ')}`);
const orphaned = topics.filter((s) => !refs.some((r) => r.slug === s));
if (orphaned.length) errors.push(`topics not reachable from any tree (orphans): ${orphaned.join(', ')}`);
if (!errors.length) pass.push(`tree refs: ${refs.length} references, all resolve, no orphans`);

// 4. Hard content rule: no em-dashes anywhere in content.
for (const dir of ['frameworks', 'cloud', 'industry', 'topics']) {
  for (const f of readdirSync(join(contentDir, dir))) {
    const p = join(contentDir, dir, f);
    if (readFileSync(p, 'utf8').includes('\u2014')) errors.push(`${rel(p)}: contains an em-dash (use a comma or colon instead)`);
  }
}
if (!errors.some((e) => e.includes('em-dash'))) pass.push('style: no em-dashes in content');

// Report.
if (errors.length) {
  console.error(`content check FAILED (${errors.length} issue${errors.length > 1 ? 's' : ''}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('content check passed:');
for (const p of pass) console.log(`  ✓ ${p}`);
