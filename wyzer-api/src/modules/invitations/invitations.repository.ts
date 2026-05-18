import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MemberRole } from '@prisma/client';

@Injectable()
export class InvitationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(organisationId: string, email: string, role: MemberRole, token: string, expiresAt: Date) {
    return this.prisma.organisationInvite.create({
      data: { organisationId, email, role, token, expiresAt },
    });
  }

  findByToken(token: string) {
    return this.prisma.organisationInvite.findUnique({
      where: { token },
      include: { organisation: { select: { id: true, name: true } } },
    });
  }

  accept(id: string) {
    return this.prisma.organisationInvite.update({
      where: { id },
      data: { acceptedAt: new Date() },
    });
  }

  listForOrg(organisationId: string) {
    return this.prisma.organisationInvite.findMany({
      where: { organisationId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        expiresAt: true,
        acceptedAt: true,
        createdAt: true,
      },
    });
  }

  listMembers(organisationId: string) {
    return this.prisma.organisationMember.findMany({
      where: { organisationId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  removeMember(organisationId: string, userId: string) {
    return this.prisma.organisationMember.deleteMany({
      where: {
        organisationId,
        userId,
        // Prevent owners removing themselves
        role: { not: MemberRole.OWNER },
      },
    });
  }
}
