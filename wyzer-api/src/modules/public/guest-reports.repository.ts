import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class GuestReportsRepository {
 constructor(private readonly prisma: PrismaService) {}

 create(data: Prisma.GuestReportCreateInput) {
  return this.prisma.guestReport.create({ data });
 }

 findByToken(token: string) {
  return this.prisma.guestReport.findUnique({ where: { shareToken: token } });
 }

 /** Daily cleanup — delete expired rows. */
 purgeExpired() {
  return this.prisma.guestReport.deleteMany({
   where: { expiresAt: { lt: new Date() } },
  });
 }

 /** Count of submissions from this email in the last `windowMs` ms. */
 countByEmailSince(email: string, since: Date) {
  return this.prisma.guestReport.count({
   where: { email, createdAt: { gte: since } },
  });
 }

 /** Mark a guest report as converted (called after the visitor signs up). */
 markConverted(token: string, userId: string) {
  return this.prisma.guestReport.update({
   where: { shareToken: token },
   data: { convertedUserId: userId },
  });
 }
}
