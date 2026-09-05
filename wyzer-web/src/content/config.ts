import { defineCollection, z } from 'astro:content';

/** The v1 framework set. Keep in sync with src/content/frameworks/*.yaml. */
export const FRAMEWORK = z.enum([
  'nist',
  'soc2',
  'iso27001',
  'gdpr',
  'hipaa',
  'pci-dss',
  'fda',
]);
export type FrameworkSlug = z.infer<typeof FRAMEWORK>;

/** Framework metadata, one YAML file per framework (id = filename). */
const frameworks = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    shortName: z.string(),
    tier: z.string().optional(),
    badgeColor: z.string(),
    sourceUrl: z.string().url(),
    blurb: z.string(),
    order: z.number().default(0),
  }),
});

/** Topics, the core screen. Cards live in frontmatter; MDX body is optional. */
const topics = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    type: z.enum(['resource-linked', 'industry-only']),
    summary: z.string().max(320),
    cards: z
      .array(
        z.object({
          framework: FRAMEWORK,
          // Short, plain-language take shown on the Topic Page card.
          plain: z.string(),
          // In-depth reading shown on the framework detail page.
          // Separate paragraphs with a blank line.
          detail: z.string().optional(),
          // One or more citations (control / article references), shown on the
          // framework detail page.
          citations: z
            .array(
              z.object({
                label: z.string(),
                url: z.string().url().optional(),
              }),
            )
            .optional(),
        }),
      )
      .min(1),
    updated: z.coerce.date().optional(),
  }),
});

/** Cloud nav tree, one YAML file per provider (id = provider slug). */
const cloud = defineCollection({
  type: 'data',
  schema: z.object({
    providerName: z.string(),
    blurb: z.string().optional(),
    order: z.number().default(0),
    categories: z.array(
      z.object({
        slug: z.string(),
        name: z.string(),
        blurb: z.string().optional(),
        resources: z.array(
          z.object({
            slug: z.string(),
            name: z.string(),
            blurb: z.string().optional(),
            configurations: z.array(
              z.object({
                slug: z.string(),
                name: z.string(),
                topic: z.string(), // topic slug, validated at build in lib/content.ts
                providerNote: z.string().optional(),
              }),
            ),
          }),
        ),
      }),
    ),
  }),
});

/** Industry nav tree, one YAML file per industry (id = industry slug). */
const industry = defineCollection({
  type: 'data',
  schema: z.object({
    industryName: z.string(),
    blurb: z.string().optional(),
    order: z.number().default(0),
    functions: z.array(
      z.object({
        slug: z.string(),
        name: z.string(),
        blurb: z.string().optional(),
        topics: z.array(
          z.object({
            slug: z.string(),
            name: z.string(),
            topic: z.string(), // topic slug, validated at build
          }),
        ),
      }),
    ),
  }),
});

export const collections = { frameworks, topics, cloud, industry };
