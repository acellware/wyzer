import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Invitations')
@UseGuards(JwtAuthGuard)
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly service: InvitationsService) {}

  @Post()
  @ApiOperation({ summary: 'Invite a user to the organisation by email' })
  create(
    @CurrentUser('orgId') orgId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateInviteDto,
  ) {
    return this.service.create(orgId, userId, dto);
  }

  @Post('accept')
  @ApiOperation({ summary: 'Accept an organisation invite (must be logged in)' })
  accept(
    @Query('token') token: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.accept(token, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List pending invites for the organisation' })
  listInvites(@CurrentUser('orgId') orgId: string) {
    return this.service.listInvites(orgId);
  }

  @Get('members')
  @ApiOperation({ summary: 'List all members of the organisation' })
  listMembers(@CurrentUser('orgId') orgId: string) {
    return this.service.listMembers(orgId);
  }

  @Delete('members/:userId')
  @ApiOperation({ summary: 'Remove a member from the organisation (admin only)' })
  removeMember(
    @CurrentUser('orgId') orgId: string,
    @CurrentUser('sub') requesterId: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.service.removeMember(orgId, targetUserId, requesterId);
  }
}
