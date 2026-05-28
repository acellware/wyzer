import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ReportStatus } from '@prisma/client';
import { ComplianceReport } from '../compliance/compliance.types';

@Injectable()
export class ReportsRepository {
 constructor(private readonly prisma: PrismaService) {}

 create(stackId: string) {
  return this.prisma.report.create({
   data: { stackId, status: ReportStatus.PENDING },
  });
 }

 async findAll(
  organisationId: string,
  opts: { take: number; cursor?: string } = { take: 25 },
 ) {
  const { take, cursor } = opts;
  const items = await this.prisma.report.findMany({
   where: { stack: { organisationId } },
   orderBy: { createdAt: 'desc' },
   take: take + 1, // fetch one extra to detect next page
   ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
   select: {
    id: true,
    status: true,
    result: true,
    error: true,
    createdAt: true,
    stack: { select: { id: true, name: true } },
   },
  });
  const hasMore = items.length > take;
  const trimmed = hasMore ? items.slice(0, take) : items;
  return {
   items: trimmed,
   nextCursor: hasMore ? trimmed[trimmed.length - 1].id : null,
  };
 }

 findOne(id: string, organisationId: string) {
  return this.prisma.report.findFirst({
   where: { id, stack: { organisationId } },
   include: {
    stack: { select: { id: true, name: true, organisationId: true } },
   },
  });
 }

 setRunning(id: string) {
  return this.prisma.report.update({
   where: { id },
   data: { status: ReportStatus.RUNNING },
  });
 }

 setDone(id: string, result: ComplianceReport) {
  return this.prisma.report.update({
   where: { id },
   data: { status: ReportStatus.DONE, result: result as object },
  });
 }

 setFailed(id: string, error: string) {
  return this.prisma.report.update({
   where: { id },
   data: { status: ReportStatus.FAILED, error },
  });
 }

 setPdfUrl(id: string, pdfUrl: string) {
  return this.prisma.report.update({
   where: { id },
   data: { pdfUrl },
  });
 }

 setShareToken(id: string, token: string, expiresAt: Date) {
  return this.prisma.report.update({
   where: { id },
   data: { shareToken: token, shareExpiresAt: expiresAt },
   select: { id: true, shareToken: true, shareExpiresAt: true },
  });
 }

 findByShareToken(token: string) {
  return this.prisma.report.findFirst({
   where: {
    shareToken: token,
    shareExpiresAt: { gt: new Date() },
   },
   include: { stack: { select: { id: true, name: true } } },
  });
 }

 /** Find the most recent DONE report for a stack newer than `since`. */
 findFreshReport(stackId: string, since: Date) {
  return this.prisma.report.findFirst({
   where: {
    stackId,
    status: ReportStatus.DONE,
    createdAt: { gt: since },
   },
   orderBy: { createdAt: 'desc' },
  });
 }

 findAllFrameworks() {
  return this.prisma.framework.findMany({
   select: { id: true, slug: true, name: true },
   orderBy: { name: 'asc' },
  });
 }
}
