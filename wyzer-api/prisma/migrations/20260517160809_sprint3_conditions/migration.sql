-- CreateEnum
CREATE TYPE "DeploymentMode" AS ENUM ('MANAGED', 'SELF_HOSTED', 'ON_PREM');

-- CreateEnum
CREATE TYPE "InputType" AS ENUM ('TOGGLE', 'RADIO', 'CHIP_MULTI');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'RUNNING', 'DONE', 'FAILED');

-- CreateTable
CREATE TABLE "technologies" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "vendor" TEXT,
    "isManaged" BOOLEAN NOT NULL DEFAULT false,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technologies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technology_config_questions" (
    "id" TEXT NOT NULL,
    "technologyId" TEXT NOT NULL,
    "signalKey" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "inputType" "InputType" NOT NULL,
    "appliesToModes" "DeploymentMode"[],
    "orderIndex" INTEGER NOT NULL,
    "options" JSONB,

    CONSTRAINT "technology_config_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stack_templates" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "useCase" TEXT,
    "dataScopes" TEXT[],
    "templateData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stack_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frameworks" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frameworks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "controls" (
    "id" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "Severity" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_control_mappings" (
    "id" TEXT NOT NULL,
    "technologyId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "deploymentMode" "DeploymentMode",
    "conditions" JSONB NOT NULL,
    "evidence" TEXT,
    "remediation" TEXT,

    CONSTRAINT "tech_control_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stacks" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dataScopes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stack_items" (
    "id" TEXT NOT NULL,
    "stackId" TEXT NOT NULL,
    "technologyId" TEXT NOT NULL,
    "deploymentMode" "DeploymentMode" NOT NULL,
    "configAnswers" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "stack_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "stackId" TEXT NOT NULL,
    "result" JSONB,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "technologies_slug_key" ON "technologies"("slug");

-- CreateIndex
CREATE INDEX "technology_config_questions_technologyId_idx" ON "technology_config_questions"("technologyId");

-- CreateIndex
CREATE UNIQUE INDEX "technology_config_questions_technologyId_signalKey_key" ON "technology_config_questions"("technologyId", "signalKey");

-- CreateIndex
CREATE UNIQUE INDEX "stack_templates_slug_key" ON "stack_templates"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "frameworks_slug_key" ON "frameworks"("slug");

-- CreateIndex
CREATE INDEX "controls_frameworkId_idx" ON "controls"("frameworkId");

-- CreateIndex
CREATE UNIQUE INDEX "controls_frameworkId_ref_key" ON "controls"("frameworkId", "ref");

-- CreateIndex
CREATE INDEX "tech_control_mappings_technologyId_idx" ON "tech_control_mappings"("technologyId");

-- CreateIndex
CREATE INDEX "tech_control_mappings_controlId_idx" ON "tech_control_mappings"("controlId");

-- CreateIndex
CREATE UNIQUE INDEX "tech_control_mappings_technologyId_controlId_deploymentMode_key" ON "tech_control_mappings"("technologyId", "controlId", "deploymentMode");

-- CreateIndex
CREATE INDEX "stacks_organisationId_idx" ON "stacks"("organisationId");

-- CreateIndex
CREATE INDEX "stack_items_stackId_idx" ON "stack_items"("stackId");

-- CreateIndex
CREATE UNIQUE INDEX "stack_items_stackId_technologyId_key" ON "stack_items"("stackId", "technologyId");

-- CreateIndex
CREATE INDEX "reports_stackId_idx" ON "reports"("stackId");

-- AddForeignKey
ALTER TABLE "technology_config_questions" ADD CONSTRAINT "technology_config_questions_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "technologies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "controls" ADD CONSTRAINT "controls_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "frameworks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_control_mappings" ADD CONSTRAINT "tech_control_mappings_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "technologies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_control_mappings" ADD CONSTRAINT "tech_control_mappings_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stacks" ADD CONSTRAINT "stacks_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stack_items" ADD CONSTRAINT "stack_items_stackId_fkey" FOREIGN KEY ("stackId") REFERENCES "stacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stack_items" ADD CONSTRAINT "stack_items_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "technologies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_stackId_fkey" FOREIGN KEY ("stackId") REFERENCES "stacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
