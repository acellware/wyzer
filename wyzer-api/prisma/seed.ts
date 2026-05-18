/**
 * T-032 — Seed script (updated)
 * Reads YAML files from data/technologies/*.yaml → upserts technologies,
 * config questions, frameworks, controls, and condition-based control mappings.
 * Reads YAML files from data/templates/*.yaml → upserts stack templates.
 *
 * Run: npx ts-node -r tsconfig-paths/register prisma/seed.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { PrismaClient, Prisma, DeploymentMode, Severity, InputType } from '@prisma/client';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────
// YAML shapes
// ─────────────────────────────────────────────────────────────────────

interface YamlCqOption {
  value: string;
  label: string;
}

interface YamlConfigQuestion {
  signal_key: string;
  question: string;
  input_type: string; // toggle | radio | chip_multi
  applies_to_modes: string[];
  order_index: number;
  options?: YamlCqOption[];
}

interface YamlConditionRule {
  signal: string;
  op: string;
  value: string | string[];
}

interface YamlConditions {
  logic: 'AND' | 'OR';
  managed_auto_pass: boolean;
  rules: YamlConditionRule[];
}

interface YamlControl {
  ref: string;
  title: string;
  severity: string;
  description?: string;
}

interface YamlControlMapping {
  framework: { slug: string; name: string };
  control: YamlControl;
  conditions: YamlConditions;
  evidence?: string;
  remediation?: string;
}

interface YamlTechnology {
  slug: string;
  name: string;
  category: string;
  vendor?: string;
  is_managed_available?: boolean;
  logo_url?: string;
  config_questions: YamlConfigQuestion[];
  control_mappings: YamlControlMapping[];
}

interface YamlTemplateItem {
  technology_slug: string;
  deployment_mode: string;
  config_answers: Record<string, string>;
}

interface YamlTemplate {
  slug: string;
  name: string;
  description: string;
  use_case?: string;
  data_scopes: string[];
  preview_tech_slugs: string[];
  items: YamlTemplateItem[];
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function toDeploymentMode(raw: string): DeploymentMode {
  const map: Record<string, DeploymentMode> = {
    MANAGED: DeploymentMode.MANAGED,
    'SELF-HOSTED': DeploymentMode.SELF_HOSTED,
    SELF_HOSTED: DeploymentMode.SELF_HOSTED,
    'ON-PREM': DeploymentMode.ON_PREM,
    ON_PREM: DeploymentMode.ON_PREM,
  };
  const v = map[raw.toUpperCase().replace(/-/g, '_').replace(/ /g, '_')];
  if (!v) throw new Error(`Unknown DeploymentMode: ${raw}`);
  return v;
}

function toSeverity(raw: string): Severity {
  const map: Record<string, Severity> = {
    CRITICAL: Severity.CRITICAL,
    HIGH: Severity.HIGH,
    MEDIUM: Severity.MEDIUM,
    LOW: Severity.LOW,
  };
  const v = map[raw.toUpperCase()];
  if (!v) throw new Error(`Unknown Severity: ${raw}`);
  return v;
}

function toInputType(raw: string): InputType {
  const map: Record<string, InputType> = {
    TOGGLE: InputType.TOGGLE,
    RADIO: InputType.RADIO,
    CHIP_MULTI: InputType.CHIP_MULTI,
  };
  const v = map[raw.toUpperCase().replace(/-/g, '_')];
  if (!v) throw new Error(`Unknown InputType: ${raw}`);
  return v;
}

// ─────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────

async function main() {
  const techDir = path.join(__dirname, '..', 'data', 'technologies');
  const tmplDir = path.join(__dirname, '..', 'data', 'templates');

  const techFiles = fs
    .readdirSync(techDir)
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));

  console.log(`Found ${techFiles.length} technology file(s): ${techFiles.join(', ')}`);

  // Build a registry of signalKeys per technology slug for template validation
  const techSignalKeys = new Map<string, Set<string>>();

  for (const file of techFiles) {
    const raw = fs.readFileSync(path.join(techDir, file), 'utf8');
    const tech = yaml.load(raw) as YamlTechnology;

    console.log(`\nSeeding technology: ${tech.name} (${tech.slug})`);

    // 1. Upsert technology
    const technology = await prisma.technology.upsert({
      where: { slug: tech.slug },
      create: {
        slug: tech.slug,
        name: tech.name,
        category: tech.category,
        vendor: tech.vendor ?? null,
        isManaged: tech.is_managed_available ?? false,
        logoUrl: tech.logo_url ?? null,
      },
      update: {
        name: tech.name,
        category: tech.category,
        vendor: tech.vendor ?? null,
        isManaged: tech.is_managed_available ?? false,
        logoUrl: tech.logo_url ?? null,
      },
    });

    // 2. Upsert config questions
    const signalKeys = new Set<string>();
    for (const q of tech.config_questions ?? []) {
      signalKeys.add(q.signal_key);

      const appliesToModes = q.applies_to_modes.map(toDeploymentMode);

      await prisma.technologyConfigQuestion.upsert({
        where: {
          technologyId_signalKey: {
            technologyId: technology.id,
            signalKey: q.signal_key,
          },
        },
        create: {
          technologyId: technology.id,
          signalKey: q.signal_key,
          question: q.question,
          inputType: toInputType(q.input_type),
          appliesToModes: appliesToModes,
          orderIndex: q.order_index,
          options: q.options ? (q.options as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
        update: {
          question: q.question,
          inputType: toInputType(q.input_type),
          appliesToModes: appliesToModes,
          orderIndex: q.order_index,
          options: q.options ? (q.options as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
      });

      console.log(`  ✓ config_question: ${q.signal_key} [${q.input_type}]`);
    }
    techSignalKeys.set(tech.slug, signalKeys);

    // 3. Collect unique frameworks
    const frameworkMap = new Map<string, { slug: string; name: string }>();
    for (const m of tech.control_mappings ?? []) {
      frameworkMap.set(m.framework.slug, m.framework);
    }

    // 4. Upsert frameworks
    const dbFrameworkIds = new Map<string, string>(); // slug → id
    for (const [slug, fw] of frameworkMap) {
      const dbFw = await prisma.framework.upsert({
        where: { slug },
        create: { slug, name: fw.name },
        update: { name: fw.name },
      });
      dbFrameworkIds.set(slug, dbFw.id);
    }

    // 5. Upsert controls + condition-based mappings
    for (const m of tech.control_mappings ?? []) {
      const frameworkId = dbFrameworkIds.get(m.framework.slug)!;

      const control = await prisma.control.upsert({
        where: { frameworkId_ref: { frameworkId, ref: m.control.ref } },
        create: {
          frameworkId,
          ref: m.control.ref,
          title: m.control.title,
          description: m.control.description,
          severity: toSeverity(m.control.severity),
        },
        update: {
          title: m.control.title,
          description: m.control.description,
          severity: toSeverity(m.control.severity),
        },
      });

      // Upsert mapping — null deploymentMode means applies to all modes
      // Due to NULL != NULL in PostgreSQL unique constraints, use findFirst + create/update
      const existingMapping = await prisma.techControlMapping.findFirst({
        where: {
          technologyId: technology.id,
          controlId: control.id,
          deploymentMode: null,
        },
      });

      const conditionsJson = m.conditions as unknown as Record<string, unknown>;

      if (existingMapping) {
        await prisma.techControlMapping.update({
          where: { id: existingMapping.id },
          data: {
            conditions: conditionsJson as Prisma.InputJsonValue,
            evidence: m.evidence ?? null,
            remediation: m.remediation ?? null,
          },
        });
      } else {
        await prisma.techControlMapping.create({
          data: {
            technologyId: technology.id,
            controlId: control.id,
            deploymentMode: null,
            conditions: conditionsJson as Prisma.InputJsonValue,
            evidence: m.evidence ?? null,
            remediation: m.remediation ?? null,
          },
        });
      }

      console.log(
        `  ✓ ${m.framework.slug.toUpperCase()} ${m.control.ref} → conditions(${m.conditions.logic}, managed_auto_pass=${m.conditions.managed_auto_pass})`,
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // Seed stack templates
  // ─────────────────────────────────────────────────────────────────────

  if (!fs.existsSync(tmplDir)) {
    console.log('\n⚠️  No templates directory found; skipping template seed.');
  } else {
    const tmplFiles = fs
      .readdirSync(tmplDir)
      .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));

    console.log(`\nFound ${tmplFiles.length} template file(s): ${tmplFiles.join(', ')}`);

    for (const file of tmplFiles) {
      const raw = fs.readFileSync(path.join(tmplDir, file), 'utf8');
      const tmpl = yaml.load(raw) as YamlTemplate;

      console.log(`\nSeeding template: ${tmpl.name} (${tmpl.slug})`);

      // Validate configAnswers signal_keys against tech signal_keys
      for (const item of tmpl.items ?? []) {
        const signals = techSignalKeys.get(item.technology_slug);
        if (!signals) {
          throw new Error(
            `Template '${tmpl.slug}' references unknown technology slug '${item.technology_slug}'. ` +
            `Make sure the technology YAML exists.`,
          );
        }
        for (const signalKey of Object.keys(item.config_answers ?? {})) {
          // 'not_sure' is a valid meta-value; the signal key still must exist
          if (!signals.has(signalKey)) {
            throw new Error(
              `Template '${tmpl.slug}', technology '${item.technology_slug}': ` +
              `config_answers contains unknown signal_key '${signalKey}'. ` +
              `Available keys: ${[...signals].join(', ')}`,
            );
          }
        }
      }

      // Resolve technology IDs from slugs
      const resolvedItems = await Promise.all(
        (tmpl.items ?? []).map(async (item) => {
          const tech = await prisma.technology.findUnique({
            where: { slug: item.technology_slug },
          });
          if (!tech) {
            throw new Error(
              `Template '${tmpl.slug}': technology '${item.technology_slug}' not found in DB. Seed technologies first.`,
            );
          }
          return {
            technologyId: tech.id,
            deploymentMode: toDeploymentMode(item.deployment_mode),
            configAnswers: item.config_answers ?? {},
          };
        }),
      );

      const templateData = {
        items: resolvedItems,
      };

      await prisma.stackTemplate.upsert({
        where: { slug: tmpl.slug },
        create: {
          slug: tmpl.slug,
          name: tmpl.name,
          description: tmpl.description,
          useCase: tmpl.use_case ?? null,
          dataScopes: tmpl.data_scopes ?? [],
          templateData: templateData as Prisma.InputJsonValue,
        },
        update: {
          name: tmpl.name,
          description: tmpl.description,
          useCase: tmpl.use_case ?? null,
          dataScopes: tmpl.data_scopes ?? [],
          templateData: templateData as Prisma.InputJsonValue,
        },
      });

      console.log(`  ✓ Template: ${tmpl.name} (${tmpl.items?.length ?? 0} items)`);
    }
  }

  console.log('\n✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
