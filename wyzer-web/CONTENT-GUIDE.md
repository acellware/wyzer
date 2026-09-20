# Content guide — Compliance Navigator

How to add or change the Navigator's content: topics, frameworks, cloud/industry
trees, and how it all becomes the site.

Everything lives in **`wyzer-web/`** (Astro 4). The Navigator is served at
**`/navigator`** on `wyzer.acellhq.com`.

---

## Where the data lives

| Collection      | Type      | Path                           | Purpose                                  |
| --------------- | --------- | ------------------------------ | ---------------------------------------- |
| `topics`        | **MDX**   | `wyzer-web/src/content/topics/` | The knowledge cards per topic (the core) |
| `frameworks`    | YAML      | `wyzer-web/src/content/frameworks/` | Metadata for the 7 framework badges  |
| `cloud`         | YAML      | `wyzer-web/src/content/cloud/`  | "By Cloud" tree (AWS, Azure, GCP)        |
| `industry`      | YAML      | `wyzer-web/src/content/industry/` | "By Industry" tree (Fintech, Healthcare) |

Schemas are enforced by **`src/content/config.ts`** (zod). Cross-references are
validated at build time by **`src/lib/content.ts`** (`requireTopic()`).

---

## The flow (how a visitor reaches a topic)

```
Start
 ├─ By Cloud            (cloud/*.yaml)
 │   └─ provider → category → resource → configuration → topic
 └─ By Industry         (industry/*.yaml)
     └─ industry → function → topic
```

- Cloud tree = `categories[] → resources[] → configurations[]`; a configuration
  points at a topic by slug.
- Industry tree = `functions[] → topics[]`; a topic entry points at a topic by slug.
- Topics are **shared** — one topic can be reached from many providers, functions,
  and both trees.

The canvas is built in `src/pages/navigator/index.astro` from the three
collections. It renders automatically; you only add data.

---

## Adding a new topic

### 1. Create the MDX file

`src/content/topics/<slug>.mdx`, e.g. `src/content/topics/encryption-at-rest.mdx`:

```mdx
---
name: Encryption at Rest
type: resource-linked
summary: >-
  One short, plain-English paragraph. Max 320 characters.
updated: 2026-09-04
cards:
  - framework: nist
    plain: >-
      Short plain-language take, shown on the topic page card.
    detail: >-
      In-depth reading, shown on the framework detail page.
      Separate paragraphs with a blank line.
    citations:
      - label: "NIST CSF 2.0 · PR.DS"
        url: https://www.nist.gov/cyberframework
  - framework: soc2
    plain: >-
      A take for SOC 2...
---

**In practice.** Optional MDX body, rendered on the topic page under the cards.
```

Frontmatter fields:

| Field        | Required | Notes                                          |
| ------------ | -------- | ---------------------------------------------- |
| `name`       | yes      | Display name                                    |
| `type`       | yes      | `resource-linked` or `industry-only`            |
| `summary`    | yes      | Max **320 chars**                                |
| `updated`    | no       | Date, shown in page metadata                    |
| `cards[]`    | yes      | At least **1** entry per framework              |
| `cards[].framework` | yes | One of the 7 framework slugs (see below) |
| `cards[].plain`     | yes | Short plain take (card on topic page)    |
| `cards[].detail`    | no  | In-depth text (framework detail page)    |
| `cards[].citations[]` | no | `{ label, url }` list, shown on detail page |

Valid `framework` slugs: `nist`, `soc2`, `iso27001`, `gdpr`, `hipaa`,
`pci-dss`, `fda`.

### 2. Wire it into the trees

Cloud — add a configuration entry in `src/content/cloud/<provider>.yaml`:

```yaml
configurations:
  - slug: encryption-at-rest
    name: Encryption at Rest
    topic: encryption-at-rest      # must match the MDX slug
    providerNote: SSE-S3 or SSE-KMS bucket encryption.
```

Industry — add a topic entry in `src/content/industry/<industry>.yaml`:

```yaml
topics:
  - slug: storing-customer-pii
    name: Storing Customer PII
    topic: pii-storage             # must match the MDX slug
```

A topic must be reachable from **at least one** tree entry or it will be
orphaned (still fine as an SSG page, but invisible in the canvas).

### 3. Verify

```bash
cd wyzer-web
npm run content:check  # fast checklist: frameworks/topics/trees/style (see below)
npx astro check        # type/template diagnostics, 0 errors
npm run build          # validates schemas + topic slug references; fails on bad refs
npm run preview        # serve the production build to eyeball it
```

The build **fails** if a `topic:` slug does not exist (`requireTopic`). Fix
typos, rerun, done.

### The pre-push gate

A husky hook at the repo root runs `npm run check:content` **before every
`git push`** and aborts the push with a full error list if anything is wrong.
To use it, install once after cloning:

```bash
# repo root
npm install   # installs husky and wires the hooks (prepare script)
```

The checklist (also runnable anytime via `npm run check:content` from the root,
or `npm run content:check` from `wyzer-web/`):

- **Frameworks:** every `frameworks/*.yaml` matches the `FRAMEWORK` enum in
  `config.ts`, all required fields present, slug is lowercase-hyphenated.
- **Topics:** every `topics/*.mdx` has valid frontmatter, `summary` ≤ 320 chars,
  at least one card, each card's `framework` is known and `plain` is present;
  citations carry a label.
- **Trees:** every `topic:` reference in `cloud/` + `industry/` resolves to an
  existing topic, and **no topic is orphaned** (unreachable from any tree).
- **Style:** no em-dashes anywhere in content.

---

## Adding a framework

1. Create `src/content/frameworks/<slug>.yaml`:

   ```yaml
   name: NIST Cybersecurity Framework
   shortName: NIST
   tier: CSF 2.0
   badgeColor: "#3B5B8C"
   sourceUrl: https://www.nist.gov/cyberframework
   blurb: US framework of cybersecurity best practices...
   order: 1
   ```

2. **Add the slug to the `FRAMEWORK` enum** in `src/content/config.ts`
   (topics cannot reference a framework that isn't in the enum).

3. Optionally add `cards[]` for it in the relevant topics.

---

## Adding a cloud provider or industry

Create a new YAML file in `cloud/` or `industry/`, following the same nesting
as the existing files (`categories → resources → configurations`, or
`functions → topics`). `order` controls sort. The canvas, topic pages, search,
and sitemap pick it up automatically.

---

## Editing existing content

- **Plain-language tone.** Short sentences, no jargon. `summary` ≤ 320 chars.
- **No em-dashes** (hard rule across the whole site). Use a comma, colon, or a
  new sentence instead.
- **`detail` paragraphs:** separate with a blank line.
- **Citations:** always include a `label` (prefer the control ID, e.g.
  `GDPR · Article 32(1)(a)`) and an authoritative `url` (NIST, HHS, ISO, etc.).
- **`updated`:** bump the date when the content meaningfully changes.

---

## Where content shows up

| File / tree entry                | Renders as                                        |
| -------------------------------- | ------------------------------------------------- |
| `topics/*.mdx`                   | `/navigator/topic/<slug>` + detail pages per card |
| topic `cards[]`                  | `/navigator/topic/<slug>/<framework>`             |
| `cloud/*.yaml`                   | "By Cloud" branch of the canvas                   |
| `industry/*.yaml`                | "By Industry" branch of the canvas                |
| `frameworks/*.yaml`              | Framework badges/colors everywhere                |

The Pagefind search index (⌘K) is built automatically by `npm run build`
(postbuild step); topic pages are indexed automatically.

---

## Workflow

```bash
npm install            # one-time, repo root (wires the pre-push husky hook)
git checkout develop
git pull origin develop
git checkout -b <your-branch>
# ...edit content files...
cd wyzer-web && npm run content:check   # or just push; the hook runs it
git add <files> && git commit -m "Content: ..."
git push origin <your-branch>
# Open a PR into develop; review it, then merge develop into staging.
```

Branches:

- **`main`** — production state, mergeable only from develop via PRs.
- **`develop`** — the integration branch everyone works against; PRs target it.
- **`staging`** — pre-production; develop merges into it for release checks.
- Feature branches — checkout from develop, PR into develop.

Deploy is manual: `wyzer-web` builds to static and ships to Cloudflare Pages.
No build config changes are needed for content-only edits.
