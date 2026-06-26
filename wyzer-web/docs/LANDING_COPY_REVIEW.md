# Landing copy review — reframing for the full Wyzer story

**Date:** 28 May 2026
**Reviewer:** Copy audit
**Status:** Proposal only — no code changes yet

---

## TL;DR — what the current landing says vs. what it should say

**Today's landing reads as a single product:** "describe your stack → get a score in 3 seconds → fix gaps." That's literally only the **free `/check` flow**. A visitor leaving the page would think Wyzer is a free web tool.

**The actual Wyzer product is:**

- A **compliance agent that runs anywhere your code does** — CI/CD, your laptop, a server, a Kubernetes job, a scheduled cron — and produces auditor-grade, continuous evidence by inspecting your actual stack (versions, configs, cloud posture, IaC, secrets, etc.) — not just what you self-report.
- A **dashboard** that aggregates agent runs across repos / environments / clouds and tracks drift over time.
- A **paid product** under a waitlist.
- The free `/check` is a **30-second preview** — a self-reported snapshot that shows the _shape_ of what the agent delivers continuously.

So the reframe is: **lead with the agent/platform story, position `/check` as a free preview, and use it as the funnel to the waitlist.**

---

## Section-by-section recommendations

### 1. HeroSection.tsx — **CHANGE (highest priority)**

**Current**

> **Kicker:** `compliance intelligence`
> **Headline:** `Your stack. Scored against every standard.`
> **Sub:** `Describe your infrastructure once. Wyzer maps it to SOC 2, ISO 27001, GDPR, PCI-DSS, HIPAA, and NDPR — then shows you exactly what to fix.`
> **Primary CTA:** `Get your free score`
> **Secondary CTA:** `See how it works`

**Problem**

- "Describe your infrastructure once" frames the product as the self-report wizard. That is the free preview, not Wyzer.
- "Scored against every standard" is true of both flows, but the framing implies a one-off web check, not a continuous engine.
- Primary CTA ("Get your free score") makes the free check feel like the whole product.

**Suggested**

> **Kicker:** `continuous compliance for engineering teams`
> **Headline:** `Auditor-grade compliance, generated from your real stack — continuously.`
> **Sub:** `The Wyzer agent runs wherever your code does — your CI, your laptop, a server, a scheduled job — inspects your real infrastructure (versions, configs, cloud posture, secrets) and produces continuous evidence for SOC 2, ISO 27001, GDPR, PCI-DSS, HIPAA and NDPR. No spreadsheets. No consultants. No annual scramble.`
> **Primary CTA:** `Join the waitlist` → `#waitlist`
> **Secondary CTA:** `Try the free preview` → `/check` _(with sub-label "60-sec snapshot — no signup")_

**Rationale**

- "Auditor-grade" + "continuously" + "your real stack" anchors the agent value in one line.
- The sub explicitly contrasts what the agent does (inspect real infra, anywhere) with what the free check does (self-report).
- The primary CTA is now the waitlist (paid product), the secondary is the free preview (funnel).

---

### 2. ProblemSection.tsx — **MINOR TWEAK**

**Current**

> **Title:** `Compliance used to take 6 months and $50,000.`
> **Pain 1:** `Consultants cost $30k–80k` — _Compliance audits take months and require expensive external consultants who still deliver a stale spreadsheet you can't maintain yourself._
> **Pain 2:** `Reports go stale overnight` — _The moment you ship a new service or rotate a key, your compliance posture changes. Most teams audit once a year and hope for the best._
> **Pain 3:** `Six frameworks, six interpretations` — _SOC 2, ISO 27001, GDPR — each framework has hundreds of controls. Cross-mapping them manually is a dedicated full-time job._

**Problem**

- Strong section, mostly survives — but pain #2 is the exact gap the agent closes, and the current body doesn't hint at continuous evidence as the answer. We can strengthen it to set up the agent as the obvious solution.

**Suggested**

> **Title:** _(keep)_ `Compliance used to take 6 months and $50,000.`
> **Intro:** _(keep)_
> **Pain 1:** _(keep title and body — works well as-is.)_
> **Pain 2:** `Evidence is stale the moment it's collected` — _Audit screenshots and spreadsheets capture a single point in time. The minute you deploy, rotate a key, or change a config, the evidence is out of date — but your auditor still expects it to be true year-round._
> **Pain 3:** _(keep)_

**Rationale**

- Reframes pain #2 from "you audit once a year" (which sounds like the free check is the answer) to "evidence is inherently stale unless it's continuous" — which is exactly what the agent solves.

---

### 3. HowItWorksSection.tsx — **CHANGE (high priority)**

**Current**

> **Title:** `Three steps from stack to score.`
> **Intro:** `No forms to fill in. No consultants to brief. Just select your technologies and get a scored, actionable compliance report.`
> **Step 1:** `Describe your stack` — _Select the technologies powering your infrastructure — cloud providers, databases, caches, containers, IaC tools, and more. 60+ technologies supported._
> **Step 2:** `Wyzer scores it` — _Our compliance engine maps each technology against every applicable control across all selected frameworks — simultaneously, in under 3 seconds._
> **Step 3:** `Fix the gaps` — _Receive a prioritised action plan with remediation steps ranked by severity, impact, and effort. Export board-ready PDFs for your stakeholders._

**Problem**

- This is the free flow described as if it's the whole product. "Select the technologies" is what the free wizard does, not the agent.

**Suggested**

> **Kicker:** `how it works`
> **Title:** `Continuous evidence, generated wherever your code runs.`
> **Intro:** `Drop the Wyzer agent into any environment you trust — CI, a laptop, a server, a Kubernetes job. Every run produces fresh evidence, mapped to every framework you care about.`
> **Step 1:** `Run the agent` — _One command, anywhere — your CI step, a developer laptop, a scheduled job in your cluster. The agent inspects your repos, IaC, container images, cloud accounts, and runtime configs in under a minute._
> **Step 2:** `Wyzer maps and scores` — _Every signal is cross-referenced against the controls of every framework you've enabled — SOC 2, ISO 27001, GDPR, PCI-DSS, HIPAA, NDPR. Frameworks share controls; Wyzer figures out the overlap so you don't._
> **Step 3:** `Ship with evidence` — _The dashboard shows live scores per environment, drift between runs, and a prioritised remediation plan. Export board-ready and auditor-ready reports on demand._
> **Below the grid:** _Just exploring? Run a [60-second self-report preview](/check) — no signup required._

**Rationale**

- Each step now describes what the agent and dashboard do, not the free wizard.
- "Run the agent" is deliberately surface-agnostic — CI is one option among many (laptop, server, cron, K8s), so we don't paint ourselves into a CLI-only corner.
- The "preview" line at the bottom funnels curious visitors to `/check` without making it the main story.

---

### 4. FeaturesSection.tsx — **CHANGE**

**Current features**

1. `Multi-framework scoring` — _Map your stack against SOC 2, ISO 27001, GDPR, PCI-DSS, HIPAA, and NDPR simultaneously — not one framework at a time._
2. `Instant analysis` — _From stack description to full scored report in under 3 seconds. No waiting, no forms, no consultants._
3. `Severity-ranked gaps` — _Every gap is ranked critical / major / minor based on the control's risk weight. Know exactly what to fix first._
4. `PDF export` — _Generate board-ready, audit-ready compliance reports in one click. Formatted for stakeholders, not engineers._
5. `Team workspaces` — _Share stacks with your security, engineering, and compliance teams. Track remediation progress across the org._
6. `Wyzer Open Spec` — _An open YAML specification for compliance mappings — analogous to OpenAPI. Use it, extend it, contribute back._

**Problem**

- "Instant analysis" / "From stack description" describes the free flow.
- Missing the entire agent value prop: runs anywhere, drift detection, continuous evidence, real config inspection.

**Suggested feature set** _(replace 1–2, add agent/drift, keep the rest)_

1. `Runs anywhere` _(new)_ — _One agent, every surface. Drop it in CI, on a developer laptop, on a server, in a Kubernetes job, or behind a cron — no separate infra to operate._
2. `Multi-framework mapping` _(rename from "scoring")_ — _One run maps to SOC 2, ISO 27001, GDPR, PCI-DSS, HIPAA and NDPR simultaneously. We pre-compute the overlap between framework controls so you don't double-work._
3. `Continuous drift detection` _(new — replaces "Instant analysis")_ — _We diff every run against your last clean baseline. The moment a control regresses — a public bucket, a stale key, an unencrypted volume — your team gets a notification, not an audit-week surprise._
4. `Severity-ranked gaps` _(keep)_
5. `Auditor-ready evidence` _(rename "PDF export")_ — _Every control gets a timestamped artifact: the config we read, the framework controls it satisfies, and the run that produced it. Hand your auditor a link, not a spreadsheet._
6. `Team workspaces` _(keep)_
7. `Wyzer Open Spec` _(keep)_

**Rationale**

- Three features now anchor the agent value: runs anywhere, continuous, evidence-grade. The other three keep the existing strengths.

---

### 5. FrameworksSection.tsx — **NO CHANGE**

This section is product-agnostic — it documents framework coverage and control counts. Survives the reframe as-is.

_(Optional: change the "✓ Full coverage" label on each card to `✓ Fully mapped` for slightly tighter copy. Not required.)_

---

### 6. PricingSection.tsx — **CHANGE**

**Current**

- **Free** ($0 / forever) — _For solo founders validating a stack._ → 1 stack / 2 frameworks / Gap summary report.
- **Pro** ($49/mo) — _For engineers and compliance leads who need the full picture._ → Unlimited stacks / All 6 frameworks / PDF export / Priority gap ranking.
- **Team** ($199/mo) — _For compliance teams tracking remediation across the org._ → Unlimited stacks + team seats + SSO/SAML.

**Problem**

- All three tiers are framed around the **web dashboard's** notion of "stacks." None reference the agent, scan runs, or environments — even though that's where the real value sits.
- "Free" is described as a tier, but in the reframed story the free thing is the `/check` preview, not a perpetual plan. We should either drop the Free tier entirely from pricing (and surface it elsewhere as "Free preview"), or rename it.

**Suggested** _(structure change — three tiers anchored on agent usage)_

- **Preview** ($0) _(was "Free")_ — _Try the engine for free._
  - 1 self-reported stack snapshot · 2 frameworks · summary report · no signup required
  - **CTA:** _Run a free check_ → `/check`
- **Starter** ($49/mo) _(was "Pro")_ — _For one team shipping one product._
  - 1 project · 1 environment · All 6 frameworks · Agent on any surface (CI, laptop, server) · Continuous drift detection · Auditor-ready evidence export · 90-day evidence retention
  - **CTA:** _Join the waitlist_
- **Scale** ($199/mo) _(was "Team")_ — _For multi-product orgs and compliance teams._
  - Unlimited projects & environments · All 6 frameworks · Agent on any surface · Drift detection + Slack/PagerDuty alerts · 12-month evidence retention · Team seats (up to 20) · SSO/SAML
  - **CTA:** _Join the waitlist_

**Rationale**

- Tier 1 is honestly labelled as the preview funnel — not a long-term plan, so we don't accidentally cannibalize Starter.
- Tier 2 and 3 anchor on **projects / environments / agent runs / evidence retention** — the units the agent actually meters.
- "Drift detection," "evidence retention," and "alerts" make the paid tiers concrete differentiators.

---

### 7. CtaSection.tsx — **MINOR TWEAK**

**Current**

> **Kicker:** `ready when you are`
> **Title:** `Know your compliance score today.`
> **Sub:** `Run a free check now, or join the waitlist for early CLI access.`
> Primary: waitlist form · Secondary: `Or run a free check now →`

**Suggested**

> **Kicker:** `ready when you are`
> **Title:** `Stop auditing once a year. Start auditing continuously.`
> **Sub:** `Join the waitlist for the Wyzer agent and dashboard, or run a free 60-second preview to see how it works.`
> Primary: waitlist form _(keep)_ · Secondary: `Or run a free preview →` _(rename)_

**Rationale**

- Title now contrasts the old world ("once a year") with the new ("every push") — same line tells the story the page has been building.
- Secondary CTA renamed from "free check" to "free preview" to consistently position `/check` as a sample, not the product.

---

### 8. WaitlistSection.tsx — **MINOR TWEAK**

**Current**

> **Pill:** `Free — no credit card required`
> **Title:** `Be first when we open the doors.`
> **Sub:** `Join the waitlist for early access to the Wyzer agent and full dashboard. We'll email you when your slot opens up.`
> **Footnote:** `HIPAA, PCI-DSS, NDPR and more frameworks coming soon.`

**Problem**

- The "Free — no credit card" pill is misleading here — this is the waitlist for a paid product, not a free tier. It belongs on the `/check` CTA, not the waitlist.
- Footnote is wrong: HIPAA / PCI-DSS / NDPR are already in the framework list above.

**Suggested**

> **Pill:** `Limited early-access cohort`
> **Title:** `Be first when we open the doors.` _(keep)_
> **Sub:** `Early access to the Wyzer agent, the dashboard, and direct support from the team. Founding-cohort pricing locked in for life.`
> **Footnote:** `We're onboarding ~20 teams per month. Earlier = sooner.`

**Rationale**

- Pill now reflects scarcity (truth in advertising for an early-access waitlist).
- Sub adds two concrete reasons to sign up _now_ vs. later: founding-cohort pricing + direct support.
- Footnote nudges urgency without being aggressive.

---

### 9. Other touchpoints — **NO CHANGE NEEDED**

- **Navbar:** `Free check` and `Join waitlist` labels are correctly framed.
- **Footer:** `Join waitlist` and `Free check` CTAs match.
- **HeroSection's framework chips strip** (`SOC 2 · ISO 27001 · …`): keep as-is.
- **ScoreCardMockup:** purely visual — no copy change.

---

## Summary table

| Section           | Action                                                                                            | Priority  |
| ----------------- | ------------------------------------------------------------------------------------------------- | --------- |
| HeroSection       | **Rewrite** — lead with agent / continuous story, demote free check to secondary CTA              | 🔴 High   |
| ProblemSection    | **Tweak** — sharpen "stale evidence" pain to set up the agent                                     | 🟡 Low    |
| HowItWorksSection | **Rewrite** — describe agent flow (run → map → ship), add preview link below                      | 🔴 High   |
| FeaturesSection   | **Edit** — swap 2–3 features to runs-anywhere / drift / evidence                                  | 🟠 Medium |
| FrameworksSection | **No change**                                                                                     | —         |
| PricingSection    | **Rewrite tiers** — anchor on projects / environments / evidence retention; rename Free → Preview | 🟠 Medium |
| CtaSection        | **Tweak** — sharper title, "free preview" wording                                                 | 🟡 Low    |
| WaitlistSection   | **Tweak** — replace misleading "Free" pill, add cohort-pricing hook                               | 🟡 Low    |

---

## Optional next step

Once these copies are aligned, the metadata pieces should follow:

- **Page `<title>` / meta description** in `index.html` should mention "continuous compliance" / "agent that runs anywhere" — not just "score your stack."
- **OG/Twitter card image** should show an agent run + dashboard, not just the wizard.

Both are outside the scope of this review but worth queueing.
