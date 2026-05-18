import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface AuditLogEntry {
  organisationId: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Write an audit log entry. Fire-and-forget — never throws.
   */
  async record(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          ...entry,
          metadata: entry.metadata as Prisma.InputJsonValue | undefined,
        },
      });
    } catch {
      // Audit log failures must never break the main request
    }
  }

  /**
   * Return the audit log for an organisation, newest first.
   * Scoped to 500 entries to prevent unbounded queries.
   */
  findForOrg(organisationId: string, limit = 100) {
    return this.prisma.auditLog.findMany({
      where: { organisationId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 500),
      select: {
        id: true,
        userId: true,
        action: true,
        resourceType: true,
        resourceId: true,
        metadata: true,
        createdAt: true,
      },
    });
  }
}
