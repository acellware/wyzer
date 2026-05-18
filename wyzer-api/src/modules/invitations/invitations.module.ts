import { Module } from '@nestjs/common';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { InvitationsRepository } from './invitations.repository';
import { EmailModule } from '../email/email.module';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [InvitationsController],
  providers: [InvitationsService, InvitationsRepository],
})
export class InvitationsModule {}
