# Wyzer — Continuous compliance for engineering teams

Wyzer helps engineering teams stay audit-ready across SOC 2, ISO 27001, GDPR, PCI-DSS, HIPAA, and NDPR. The Wyzer agent inspects your real infrastructure and ships continuous evidence, so compliance keeps up with your stack instead of becoming a once-a-year scramble.

This repository holds Wyzer's web presence and its backend API.

---

## Repo structure

```
wyzer/
├── wyzer-web/        # Astro 4 site — marketing landing + the Compliance Navigator
├── wyzer-api/        # NestJS 10 backend (Prisma, PostgreSQL, Redis/BullMQ)
├── docker-compose.yml
└── .github/workflows/deploy-api.yml   # Fly.io CI/CD for the API
```

---

## wyzer-web — marketing site + Compliance Navigator

A single Astro app served on one domain (`wyzer.acellhq.com`):

- **`/`** — marketing landing, legal pages, and the waitlist. Built from React islands, server-rendered for SEO.
- **`/navigator`** — the **Compliance Navigator**, an interactive, educational explorer. Pick a slice of your stack (by cloud or by industry) and it shows, in plain English, what each framework expects for that topic, with citations. Full-text search via Pagefind, a pannable canvas view, and a light/dark theme.

**Tech:** Astro 4, React islands, Tailwind CSS, MDX, Pagefind. Deploys to Cloudflare Pages.

```bash
cd wyzer-web
npm install
npm run dev        # http://localhost:4321
npm run build      # static build + Pagefind index
npm run preview    # serve the production build (port 4321)
npm run check      # astro check (type + template diagnostics)
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

- Node.js 20+
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
# Swagger: http://localhost:3001/api/docs
```

### Tests

```bash
cd wyzer-api
npm test            # unit tests
npm run test:e2e    # integration tests (needs postgres + redis)
```

---

## Frameworks covered

| Framework | Version                            |
| --------- | ---------------------------------- |
| SOC 2     | Trust Service Criteria             |
| ISO 27001 | 2022                               |
| GDPR      | EU 2016/679                        |
| PCI-DSS   | v4.0                               |
| HIPAA     | Security Rule                      |
| NDPR      | Nigeria Data Protection Regulation |

---

## Deployment

- **wyzer-web** → Cloudflare Pages (static build; `wyzer.acellhq.com`).
- **wyzer-api** → Fly.io via `.github/workflows/deploy-api.yml` (`main` → prod, `staging` → staging). Requires the `FLY_API_TOKEN` GitHub secret.
</content>
</invoke>
