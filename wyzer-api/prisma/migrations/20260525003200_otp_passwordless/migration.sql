-- AlterTable
ALTER TABLE "organisations" ALTER COLUMN "size" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL,
ALTER COLUMN "passwordHash" DROP NOT NULL,
ALTER COLUMN "jobTitle" DROP NOT NULL,
ALTER COLUMN "country" DROP NOT NULL;

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "otp_codes_codeHash_key" ON "otp_codes"("codeHash");

-- CreateIndex
CREATE INDEX "otp_codes_email_idx" ON "otp_codes"("email");
