import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Plan } from '@prisma/client';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PlanGuard } from '../../common/guards/plan.guard';
import { RequiredPlan } from '../../common/decorators/required-plan.decorator';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Trigger a compliance assessment report' })
  create(
    @CurrentUser('orgId') orgId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.service.create(orgId, dto, userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Poll report status and result' })
  findOne(
    @CurrentUser('orgId') orgId: string,
    @Param('id') id: string,
  ) {
    return this.service.findOne(id, orgId);
  }

  /**
   * T-040: Enqueue PDF generation for a completed report.
   * PRO+ plan required (T-047).
   */
  @Post(':id/pdf')
  @UseGuards(JwtAuthGuard, PlanGuard)
  @RequiredPlan(Plan.PRO)
  @ApiOperation({ summary: 'Request PDF generation for a report (PRO+)' })
  requestPdf(
    @CurrentUser('orgId') orgId: string,
    @Param('id') id: string,
  ) {
    return this.service.requestPdf(id, orgId);
  }

  /**
   * T-041: Generate a share token and return the public share URL.
   */
  @Post(':id/share')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate a shareable link for a report (30 days)' })
  createShareToken(
    @CurrentUser('orgId') orgId: string,
    @Param('id') id: string,
  ) {
    return this.service.createShareToken(id, orgId);
  }

  /**
   * T-041: Public endpoint — fetch a shared report by token, no auth required.
   */
  @Get('share/:token')
  @ApiOperation({ summary: 'Fetch a publicly shared report by token' })
  findByShareToken(@Param('token') token: string) {
    return this.service.findByShareToken(token);
  }
}
