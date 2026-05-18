# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — deps: install production + dev dependencies
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine3.21 AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — development: used by docker-compose for local hot-reload
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine3.21 AS development
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (schema is volume-mounted in compose, but needed here
# for standalone dev container builds)
RUN npx prisma generate

EXPOSE 3001
CMD ["npm", "run", "start:dev"]

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 — builder: compile TypeScript to JS
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine3.21 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate && npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 4 — production: lean image with only runtime artefacts
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine3.21 AS production
WORKDIR /app

ENV NODE_ENV=production

# Upgrade OS packages to pick up any security patches not yet in the base image
RUN apk upgrade --no-cache

# Install only production deps in a fresh layer
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output and required runtime files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

# Non-root user for least-privilege (OWASP A05)
RUN addgroup -S wyzer && adduser -S wyzer -G wyzer
USER wyzer

EXPOSE 3001

# Run pending migrations then start the compiled server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
