import { Controller, Get, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Audit Log')
@UseGuards(JwtAuthGuard)
@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly service: AuditLogService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit log for the current organisation' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @CurrentUser('orgId') orgId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.service.findForOrg(orgId, limit);
  }
}
