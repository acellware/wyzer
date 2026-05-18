# Wyzer — Compliance Intelligence Platform

Wyzer helps engineering teams understand their compliance posture across SOC 2, ISO 27001, GDPR, PCI-DSS, HIPAA, and NDPR — without a consultant. You describe your tech stack; Wyzer scores your gaps, generates a shareable report, and tells you exactly what to fix.

---

## Repo Structure

```
wyzer/
├── wyzer-api/        # NestJS 10 backend (TypeScript, Prisma, PostgreSQL, Redis)
├── wyzer-web/        # React 18 frontend (Vite, TypeScript, Tailwind, React Query)
├── docker-compose.yml
└── .github/
    └── workflows/
        └── deploy-api.yml   # Fly.io CI/CD
```

---

## Tech Stack

| Layer         | Technology                                      |
| ------------- | ----------------------------------------------- |
| API           | NestJS 10, TypeScript strict, Prisma 5          |
| Database      | PostgreSQL 16                                   |
| Cache / Queue | Redis 7, BullMQ                                 |
| Auth          | JWT RS256 (asymmetric), HttpOnly refresh cookie |
| Email         | Resend (prod) / Mailhog (local dev)             |
| Storage       | Cloudflare R2 (S3-compatible, PDF reports)      |
| Billing       | Stripe Checkout + webhooks                      |
| Frontend      | React 18, Vite 5, Tailwind CSS, React Query     |
| Logging       | nestjs-pino (JSON in prod, pino-pretty in dev)  |
| Deploy        | Fly.io (`wyzer-api-prod` / `wyzer-api-staging`) |

---

## Local Development

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

Open `wyzer-api/.env` and fill in the JWT keys (paste the PEM content with literal `\n` line breaks):

```bash
# Quick way to format keys for .env
JWT_PRIVATE_KEY=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' wyzer-api/private.pem)
JWT_PUBLIC_KEY=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' wyzer-api/public.pem)
```

**For local dev**, only the JWT keys are required. Everything else has a working default:

| Variable         | Local default                                              | Notes                               |
| ---------------- | ---------------------------------------------------------- | ----------------------------------- |
| `DATABASE_URL`   | `postgresql://wyzer:wyzer_secret@localhost:5432/wyzer_dev` | Docker postgres                     |
| `REDIS_URL`      | `redis://localhost:6379`                                   | Docker redis                        |
| `RESEND_API_KEY` | any string                                                 | Mailhog intercepts all mail locally |
| `R2_*`           | empty                                                      | Only needed to test PDF export      |
| `STRIPE_*`       | `sk_test_...`                                              | Only needed to test billing         |

### 3. Start infrastructure

```bash
docker compose up db redis mailhog -d
```

Mailhog web UI (view emails): **http://localhost:8025**

### 4. Database setup

```bash
cd wyzer-api
npx prisma migrate deploy   # run all migrations
npx prisma db seed          # seed frameworks, technologies, templates
```

### 5. Run the API

```bash
cd wyzer-api
npm run start:dev
# API:     http://localhost:3001/api/v1
# Swagger: http://localhost:3001/api/docs
```

### 6. Run the frontend

```bash
cd wyzer-web
npm run dev
# App: http://localhost:3000
```

---

## Running with Docker Compose (full stack)

```bash
docker compose --profile web up --build
```

Services: db → redis → mailhog → api (waits for healthy) → web.

---

## Testing

### API unit + integration tests

```bash
cd wyzer-api
npm test                  # 54 unit tests
npm run test:e2e          # 26 integration tests (requires running postgres + redis)
```

### Frontend Playwright E2E

```bash
cd wyzer-web
npx playwright test       # 16 tests (spins up Vite dev server automatically)
```

---

## Frameworks Covered

| Framework     | Version                            |
| ------------- | ---------------------------------- |
| SOC 2 Type II | Trust Service Criteria             |
| ISO 27001     | 2022                               |
| GDPR          | EU 2016/679                        |
| PCI-DSS       | v4.0                               |
| HIPAA         | Security Rule                      |
| NDPR          | Nigeria Data Protection Regulation |

44 technology integrations including PostgreSQL, Redis, Docker, Terraform, AWS EC2/S3/ECS/EKS/Lambda, Kubernetes, GitHub Actions, Cloudflare, Nginx, MongoDB, MySQL, Kafka, HashiCorp Vault, GCP, Azure, DigitalOcean, Vercel, Fly.io, and more.

---

## Deployment

The API auto-deploys to Fly.io on push via `.github/workflows/deploy-api.yml`:

- `main` branch → `wyzer-api-prod`
- `staging` branch → `wyzer-api-staging`

Required GitHub secret: `FLY_API_TOKEN`

---

## Plans

| Plan | Stacks    | Reports   | PDF Export | Team seats |
| ---- | --------- | --------- | ---------- | ---------- |
| Free | 1         | 3 / month | —          | 1          |
| Pro  | 5         | Unlimited | ✓          | 1          |
| Team | Unlimited | Unlimited | ✓          | Up to 20   |
