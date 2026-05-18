import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { MemberRole } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { InvitationsRepository } from './invitations.repository';
import { EmailService } from '../email/email.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import type { Env } from '../../config/env.schema';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly repo: InvitationsRepository,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  /**
   * Create and send an invitation. Only ADMIN or OWNER may invite.
   * Cannot invite someone already a member.
   */
  async create(organisationId: string, inviterId: string, dto: CreateInviteDto) {
    // Permission check: only ADMIN/OWNER can invite
    const inviter = await this.prisma.organisationMember.findUnique({
      where: { organisationId_userId: { organisationId, userId: inviterId } },
    });

    if (!inviter || inviter.role === MemberRole.MEMBER) {
      throw new ForbiddenException('Only admins can invite members');
    }

    // Cannot invite existing members
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      const member = await this.prisma.organisationMember.findFirst({
        where: { organisationId, userId: existing.id },
      });
      if (member) throw new BadRequestException('This user is already a member');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await this.repo.create(organisationId, dto.email, dto.role, token, expiresAt);

    const org = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
      select: { name: true },
    });

    const appUrl = this.config.get('APP_URL', { infer: true });
    const inviteUrl = `${appUrl}/invitations/accept?token=${token}`;

    // Fire-and-forget — email failure should not break the invite creation
    this.emailService
      .sendInviteEmail(dto.email, org?.name ?? 'Your team', inviteUrl)
      .catch(() => void 0);

    return { id: invite.id, email: invite.email, role: invite.role, expiresAt: invite.expiresAt };
  }

  /**
   * Accept an invite by token. Creates an OrganisationMember row.
   * Requires the calling user to be registered and authenticated.
   */
  async accept(token: string, userId: string) {
    const invite = await this.repo.findByToken(token);

    if (!invite) throw new NotFoundException('Invite not found');
    if (invite.acceptedAt) throw new BadRequestException('Invite already accepted');
    if (invite.expiresAt < new Date()) throw new BadRequestException('Invite has expired');

    // Verify the email matches the authenticated user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (user?.email !== invite.email) {
      throw new ForbiddenException('This invite was sent to a different email address');
    }

    await this.prisma.$transaction([
      this.prisma.organisationMember.create({
        data: {
          organisationId: invite.organisationId,
          userId,
          role: invite.role,
        },
      }),
      this.prisma.organisationInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      }),
    ]);

    return { message: 'You have joined the organisation', organisationId: invite.organisationId };
  }

  listInvites(organisationId: string) {
    return this.repo.listForOrg(organisationId);
  }

  listMembers(organisationId: string) {
    return this.repo.listMembers(organisationId);
  }

  async removeMember(organisationId: string, targetUserId: string, requesterId: string) {
    // Only ADMIN/OWNER may remove members
    const requester = await this.prisma.organisationMember.findUnique({
      where: { organisationId_userId: { organisationId, userId: requesterId } },
    });

    if (!requester || requester.role === MemberRole.MEMBER) {
      throw new ForbiddenException('Only admins can remove members');
    }

    // Owners cannot be removed
    const target = await this.prisma.organisationMember.findUnique({
      where: { organisationId_userId: { organisationId, userId: targetUserId } },
    });

    if (target?.role === MemberRole.OWNER) {
      throw new ForbiddenException('Organisation owners cannot be removed');
    }

    await this.repo.removeMember(organisationId, targetUserId);
    return { message: 'Member removed' };
  }
}
