# Wyzer — Continuous compliance for engineering teams

Wyzer helps engineering teams stay audit-ready across NIST, SOC 2, ISO 27001, GDPR, HIPAA, PCI DSS, and FDA. The Wyzer agent inspects your real infrastructure and ships continuous evidence, so compliance keeps up with your stack instead of becoming a once-a-year scramble.

This repository holds Wyzer's web presence and its backend API.

---

## Repo structure

```
wyzer/
├── wyzer-web/        # Astro 4 site — marketing landing + the Compliance Navigator
├── wyzer-api/        # NestJS 10 backend (Prisma, PostgreSQL, Redis/BullMQ)
└── docker-compose.yml
```

---

## wyzer-web — marketing site + Compliance Navigator

A single Astro app served on one domain (`wyzer.acellhq.com`):

- **`/`** — marketing landing, legal pages, and the waitlist. Built from React islands, server-rendered for SEO.
- **`/navigator`** — the **Compliance Navigator**, an interactive, educational explorer. Pick a slice of your stack (by cloud or by industry) and it shows, in plain English, what each framework expects for that topic, with citations. Full-text search via Pagefind, a pannable canvas view, and a light/dark theme.

> Adding or editing Navigator content? See [**`wyzer-web/CONTENT-GUIDE.md`**](wyzer-web/CONTENT-GUIDE.md).

**Tech:** Astro 4, React islands, Tailwind CSS, MDX, Pagefind. Deploys to Cloudflare Pages.

```bash
cd wyzer-web
npm install
npm run dev           # http://localhost:4321
npm run build         # static build + Pagefind index
npm run preview       # serve the production build (port 4321)
npm run check         # astro check (type + template diagnostics)
npm run content:check # Navigator content checklist (frameworks/topics/trees/style)
```

Environment — `cp .env.example .env`:

| Variable                 | Purpose                                        | Default                          |
| ------------------------ | ---------------------------------------------- | -------------------------------- |
| `PUBLIC_API_URL`         | Backend base URL for the waitlist form         | `http://localhost:3001/api/v1`   |
| `PUBLIC_GA_ID`           | GA4 measurement ID (consent-gated)             | shared property                  |
| `PUBLIC_ANALYTICS_DEBUG` | Log analytics events to the console            | off                              |

The public origin is set in `astro.config.mjs` (`site: https://wyzer.acellhq.com`).

---

## wyzer-api — backend API

NestJS 10 (TypeScript strict, Prisma 5) with PostgreSQL, Redis/BullMQ, JWT auth, and Swagger docs. It backs the site (for example, the waitlist endpoint).

### Prerequisites

- Node.js 18.17+ (Astro 4 requirement; we develop on Node 22)
- Docker + Docker Compose

### 1. Generate JWT keys

```bash
cd wyzer-api
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

### 2. Configure environment

```bash
cp wyzer-api/.env.example wyzer-api/.env
```

For local dev only the JWT keys are required; everything else defaults to the Docker services below.

### 3. Start infrastructure

```bash
docker compose up db redis mailhog -d
# Mailhog web UI (view local mail): http://localhost:8025
```

### 4. Database

```bash
cd wyzer-api
npx prisma migrate deploy   # run migrations
npx prisma db seed          # seed frameworks, technologies, templates
```

### 5. Run the API

```bash
cd wyzer-api
npm run start:dev
# API:     http://localhost:3001/api/v1
# Swagger: http://localhost:3001/docs
```

### Tests

```bash
cd wyzer-api
npm test            # unit tests
npm run test:e2e    # integration tests (needs postgres + redis)
```

---

## Frameworks covered

The Navigator's framework set (mirrors `wyzer-web/src/content/config.ts`):

| Framework        | Version                            |
| ---------------- | ---------------------------------- |
| NIST             | Cybersecurity Framework, CSF 2.0   |
| SOC 2            | Trust Services Criteria            |
| ISO/IEC 27001    | 2022                               |
| GDPR             | EU 2016/679                        |
| HIPAA            | Security Rule                      |
| PCI DSS          | v4.0                               |
| FDA              | 21 CFR Part 11 (electronic records) |

---

## Deployment

- **wyzer-web** → Cloudflare Pages (static build; `wyzer.acellhq.com`).
- **wyzer-api** → Fly.io, deployed manually with `flyctl deploy` (`fly.staging.toml` / `fly.toml`).
</content>
</invoke>
