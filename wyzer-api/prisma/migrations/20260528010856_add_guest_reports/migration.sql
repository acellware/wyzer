-- CreateTable
CREATE TABLE "guest_reports" (
    "id" TEXT NOT NULL,
    "shareToken" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "stackName" TEXT,
    "dataScopes" TEXT[],
    "selections" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "score" INTEGER,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "convertedUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guest_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guest_reports_shareToken_key" ON "guest_reports"("shareToken");

-- CreateIndex
CREATE INDEX "guest_reports_email_idx" ON "guest_reports"("email");

-- CreateIndex
CREATE INDEX "guest_reports_createdAt_idx" ON "guest_reports"("createdAt");

-- CreateIndex
CREATE INDEX "guest_reports_expiresAt_idx" ON "guest_reports"("expiresAt");

-- CreateIndex
CREATE INDEX "guest_reports_convertedUserId_idx" ON "guest_reports"("convertedUserId");
