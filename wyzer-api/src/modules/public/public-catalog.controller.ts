import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeploymentMode } from '@prisma/client';
import { TechnologiesService } from '../technologies/technologies.service';
import { StackTemplatesService } from '../stack-templates/stack-templates.service';
import { QueryTechnologiesDto } from '../technologies/dto/query-technologies.dto';
import { ConfigQuestionsQueryDto } from '../technologies/dto/config-questions-query.dto';
import {
 RateLimit,
 RateLimitGuard,
} from '../../common/guards/rate-limit.guard';

/**
 * Read-only catalog endpoints exposed under /public for the guest flow.
 * Same services as the authed routes, no JwtAuthGuard.
 *
 * Rate limit is loose since these are static-ish reference data, but still
 * applied to defend against scraping floods.
 */
@ApiTags('Public')
@UseGuards(RateLimitGuard)
@Controller('public')
export class PublicCatalogController {
 constructor(
  private readonly technologies: TechnologiesService,
  private readonly stackTemplates: StackTemplatesService,
 ) {}

 // ── Stack templates ─────────────────────────────────────────────────────
 @Get('stack-templates')
 @RateLimit({ limit: 60, windowSeconds: 60 })
 @ApiOperation({ summary: 'List stack templates (public)' })
 listStackTemplates() {
  return this.stackTemplates.findAll();
 }

 @Get('stack-templates/:slug')
 @RateLimit({ limit: 60, windowSeconds: 60 })
 @ApiOperation({ summary: 'Get a stack template by slug (public)' })
 getStackTemplate(@Param('slug') slug: string) {
  return this.stackTemplates.findBySlug(slug);
 }

 // ── Technologies ────────────────────────────────────────────────────────
 @Get('technologies')
 @RateLimit({ limit: 60, windowSeconds: 60 })
 @ApiOperation({ summary: 'List technologies (public, paginated)' })
 listTechnologies(@Query() dto: QueryTechnologiesDto) {
  return this.technologies.findMany(dto);
 }

 @Get('technologies/:id/config-questions')
 @RateLimit({ limit: 60, windowSeconds: 60 })
 @ApiOperation({ summary: 'Get config questions for a technology (public)' })
 getConfigQuestions(
  @Param('id') id: string,
  @Query() dto: ConfigQuestionsQueryDto,
 ) {
  const mode = dto.deploymentMode as DeploymentMode | undefined;
  return this.technologies.getConfigQuestions(id, mode);
 }

 @Get('technologies/:slug')
 @RateLimit({ limit: 60, windowSeconds: 60 })
 @ApiOperation({ summary: 'Get a technology by slug (public)' })
 getTechnology(@Param('slug') slug: string) {
  return this.technologies.findBySlug(slug);
 }

 // ── Data scopes (static — inline definitions for the public surface) ────
 @Get('data-scopes')
 @RateLimit({ limit: 60, windowSeconds: 60 })
 @ApiOperation({ summary: 'List data scopes (public)' })
 listDataScopes() {
  return PUBLIC_DATA_SCOPES;
 }
}

/**
 * Mirror of the authed DataScopesController static list.
 * Kept inline here to avoid importing a controller-only constant.
 */
const PUBLIC_DATA_SCOPES = [
 {
  id: 'pii',
  label: 'Personal Data (PII)',
  description:
   'Names, emails, addresses, IP addresses, or any data that can identify an individual.',
  triggeredFrameworkSlugs: ['gdpr', 'ndpr', 'soc2'],
 },
 {
  id: 'phi',
  label: 'Health Data (PHI)',
  description:
   'Medical records, diagnoses, treatment data, or any Protected Health Information.',
  triggeredFrameworkSlugs: ['hipaa', 'soc2'],
 },
 {
  id: 'financial',
  label: 'Financial & Payment Data',
  description:
   'Credit card numbers, bank account details, or payment card industry data.',
  triggeredFrameworkSlugs: ['pci-dss', 'soc2'],
 },
 {
  id: 'general',
  label: 'General Business Data',
  description:
   'Operational data, business metrics, or internal records without regulated sensitivity.',
  triggeredFrameworkSlugs: ['soc2', 'iso27001'],
 },
];
