-- Sprint 4: sharing (T-041), org invites (T-043), audit log (T-044), billing prep (T-046)

-- AlterTable: Report — PDF url and share token fields
ALTER TABLE "reports" ADD COLUMN "pdfUrl" TEXT,
                      ADD COLUMN "shareToken" TEXT,
                      ADD COLUMN "shareExpiresAt" TIMESTAMP(3);

-- AlterTable: Organisation — Stripe customer ID
ALTER TABLE "organisations" ADD COLUMN "stripeCustomerId" TEXT;

-- CreateTable: organisation_invites
CREATE TABLE "organisation_invites" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'MEMBER',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organisation_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable: audit_logs
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reports_shareToken_key" ON "reports"("shareToken");

-- CreateIndex
CREATE UNIQUE INDEX "organisation_invites_token_key" ON "organisation_invites"("token");

-- CreateIndex
CREATE INDEX "organisation_invites_organisationId_idx" ON "organisation_invites"("organisationId");

-- CreateIndex
CREATE INDEX "organisation_invites_email_idx" ON "organisation_invites"("email");

-- CreateIndex
CREATE INDEX "audit_logs_organisationId_idx" ON "audit_logs"("organisationId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "organisation_invites" ADD CONSTRAINT "organisation_invites_organisationId_fkey"
    FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organisationId_fkey"
    FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
