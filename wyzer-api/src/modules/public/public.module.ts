import { Module } from '@nestjs/common';
import { GuestReportsController } from './guest-reports.controller';
import { GuestReportsService } from './guest-reports.service';
import { GuestReportsRepository } from './guest-reports.repository';
import { GuestReportsCleanup } from './guest-reports.cleanup';
import { PublicCatalogController } from './public-catalog.controller';
import { ComplianceModule } from '../compliance/compliance.module';
import { TechnologiesModule } from '../technologies/technologies.module';
import { StackTemplatesModule } from '../stack-templates/stack-templates.module';
import { DisposableEmailModule } from '../disposable-email/disposable-email.module';

/**
 * Public-facing routes for the free "Stack Check" funnel.
 * No authentication. Rate-limited per IP via RateLimitGuard.
 *
 * - POST /public/guest-reports          → run a free compliance check
 * - GET  /public/guest-reports/:token   → fetch a guest report by share token
 * - GET  /public/stack-templates        → list templates
 * - GET  /public/technologies           → list technologies
 * - GET  /public/data-scopes            → list data scopes
 */
@Module({
 imports: [
  ComplianceModule,
  TechnologiesModule,
  StackTemplatesModule,
  DisposableEmailModule,
 ],
 controllers: [GuestReportsController, PublicCatalogController],
 providers: [GuestReportsService, GuestReportsRepository, GuestReportsCleanup],
 exports: [GuestReportsRepository],
})
export class PublicModule {}
