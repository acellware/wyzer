import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ReportsRepository } from './reports.repository';
import { ComplianceService } from '../compliance/compliance.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { REPORT_QUEUE, ReportJobPayload } from './reports.service';
import { DeploymentMode } from '@prisma/client';

@Processor(REPORT_QUEUE)
export class ReportProcessor extends WorkerHost {
  private readonly logger = new Logger(ReportProcessor.name);

  constructor(
    private readonly repo: ReportsRepository,
    private readonly compliance: ComplianceService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<ReportJobPayload>): Promise<void> {
    const { reportId, stackId, frameworkIds } = job.data;
    this.logger.log(`Processing report ${reportId} for stack ${stackId}`);

    await this.repo.setRunning(reportId);

    try {
      // Load the stack items
      const stack = await this.prisma.stack.findUnique({
        where: { id: stackId },
        include: { items: true },
      });

      if (!stack) {
        throw new Error(`Stack ${stackId} not found during report processing`);
      }

      const assessItems = stack.items.map((item) => ({
        technologyId: item.technologyId,
        deploymentMode: item.deploymentMode as DeploymentMode,
        configAnswers: (item.configAnswers as Record<string, string>) ?? {},
      }));

      const result = await this.compliance.assess(assessItems, frameworkIds);
      await this.repo.setDone(reportId, result);

      this.logger.log(`Report ${reportId} complete`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Report ${reportId} failed: ${message}`);
      await this.repo.setFailed(reportId, message);
    }
  }
}
