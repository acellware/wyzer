import {
 BadRequestException,
 Injectable,
 Logger,
 NotFoundException,
} from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ComplianceService } from '../compliance/compliance.service';
import { DisposableEmailService } from '../disposable-email/disposable-email.service';
import { GuestReportsRepository } from './guest-reports.repository';
import { CreateGuestReportDto } from './dto/create-guest-report.dto';

/** Guest reports live for 90 days then get purged. */
const GUEST_REPORT_TTL_DAYS = 90;

/** Anti-spam: max submissions per email per 24h window. */
const MAX_PER_EMAIL_PER_DAY = 5;

interface CreateContext {
 ip?: string;
 userAgent?: string;
 referrer?: string;
}

@Injectable()
export class GuestReportsService {
 private readonly logger = new Logger(GuestReportsService.name);

 constructor(
  private readonly repo: GuestReportsRepository,
  private readonly prisma: PrismaService,
  private readonly compliance: ComplianceService,
  private readonly disposableEmail: DisposableEmailService,
 ) {}

 /**
  * Run a guest scan synchronously and persist the result.
  * Returns the public share token + the rendered report.
  */
 async create(dto: CreateGuestReportDto, ctx: CreateContext) {
  const email = dto.email.trim().toLowerCase();

  // ── Email validation ───────────────────────────────────────────────────
  if (await this.disposableEmail.isDisposable(email)) {
   throw new BadRequestException(
    'Disposable email addresses are not allowed. Please use a work email.',
   );
  }

  // ── Per-email abuse cap (sliding 24h window) ──────────────────────────
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent = await this.repo.countByEmailSince(email, since);
  if (recent >= MAX_PER_EMAIL_PER_DAY) {
   throw new BadRequestException(
    'You have reached the daily limit for free checks. Sign up to run unlimited scans.',
   );
  }

  // ── Resolve frameworks from data scopes ───────────────────────────────
  const frameworks = await this.resolveFrameworks(dto.dataScopes);
  if (frameworks.length === 0) {
   throw new BadRequestException(
    'No compliance frameworks match the selected data scopes.',
   );
  }
  const frameworkIds = frameworks.map((f) => f.id);
  const idToSlug: Record<string, string> = Object.fromEntries(
   frameworks.map((f) => [f.id, f.slug]),
  );

  // ── Validate that all technology IDs exist ────────────────────────────
  const techIds = dto.selections.map((s) => s.technologyId);
  const foundTechs = await this.prisma.technology.findMany({
   where: { id: { in: techIds } },
   select: { id: true },
  });
  if (foundTechs.length !== techIds.length) {
   throw new BadRequestException('One or more technologies are unknown.');
  }

  // ── Run the scoring engine (synchronous — guests need instant feedback) ─
  const assessItems = dto.selections.map((s) => ({
   technologyId: s.technologyId,
   deploymentMode: s.deploymentMode,
   configAnswers: s.configAnswers ?? {},
  }));

  const rawResult = await this.compliance.assess(assessItems, frameworkIds);

  // Remap frameworkScores keys from internal IDs to public slugs so the
  // guest report response is human-readable (e.g. 'soc2' instead of cuids).
  const result = {
   ...rawResult,
   frameworkScores: Object.fromEntries(
    Object.entries(rawResult.frameworkScores).map(([id, score]) => [
     idToSlug[id] ?? id,
     score,
    ]),
   ),
  };

  // Aggregate score across frameworks (simple mean, rounded).
  const scores = Object.values(result.frameworkScores);
  const aggregateScore = scores.length
   ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
   : null;

  // ── Persist ────────────────────────────────────────────────────────────
  const shareToken = randomBytes(24).toString('base64url');
  const ipHash = ctx.ip ? this.hashIp(ctx.ip) : null;
  const expiresAt = new Date(
   Date.now() + GUEST_REPORT_TTL_DAYS * 24 * 60 * 60 * 1000,
  );

  const saved = await this.repo.create({
   shareToken,
   companyName: dto.companyName.trim(),
   email,
   role: dto.role?.trim() || null,
   stackName: dto.stackName?.trim() || null,
   dataScopes: dto.dataScopes,
   selections: assessItems as unknown as object,
   result: result as unknown as object,
   score: aggregateScore,
   ipHash,
   userAgent: ctx.userAgent?.slice(0, 500) ?? null,
   referrer: ctx.referrer?.slice(0, 500) ?? null,
   utmSource: dto.utmSource ?? null,
   utmMedium: dto.utmMedium ?? null,
   utmCampaign: dto.utmCampaign ?? null,
   expiresAt,
  });

  this.logger.log(
   `Guest report ${saved.id} created (email=${email}, score=${aggregateScore})`,
  );

  return {
   shareToken: saved.shareToken,
   score: saved.score,
   result: saved.result,
   createdAt: saved.createdAt,
   expiresAt: saved.expiresAt,
  };
 }

 async findByToken(token: string) {
  const report = await this.repo.findByToken(token);
  if (!report || report.expiresAt < new Date()) {
   throw new NotFoundException('Report not found or has expired.');
  }

  // Backfill: older reports may have persisted `frameworkScores` keyed by
  // framework ID (cuid) rather than slug. Remap on read so the UI always
  // shows human-readable slugs like 'soc2', 'gdpr', etc.
  const result = await this.normalizeFrameworkScoreKeys(report.result);

  // Don't leak IP hash / email / UTM back through the public surface.
  return {
   shareToken: report.shareToken,
   companyName: report.companyName,
   stackName: report.stackName,
   dataScopes: report.dataScopes,
   score: report.score,
   result,
   createdAt: report.createdAt,
   expiresAt: report.expiresAt,
  };
 }

 /**
  * Older guest reports persisted `frameworkScores` keyed by framework ID
  * (cuid). Newer ones are keyed by slug. This method normalises both shapes
  * so the public API always returns slug-keyed scores.
  */
 private async normalizeFrameworkScoreKeys(
  rawResult: unknown,
 ): Promise<Record<string, unknown>> {
  const result =
   typeof rawResult === 'object' && rawResult !== null
    ? ({ ...(rawResult as Record<string, unknown>) } as Record<string, unknown>)
    : {};
  const scores = result.frameworkScores;
  if (!scores || typeof scores !== 'object') return result;

  const keys = Object.keys(scores as Record<string, number>);
  // Slugs are short lowercase identifiers (e.g. 'soc2', 'iso27001', 'pci-dss').
  // Cuids start with 'cm' and are 25+ chars. If every key already looks like a
  // slug, skip the lookup.
  const looksLikeCuid = (k: string) => /^c[a-z0-9]{20,}$/i.test(k);
  const idKeys = keys.filter(looksLikeCuid);
  if (idKeys.length === 0) return result;

  const frameworks = await this.prisma.framework.findMany({
   where: { id: { in: idKeys } },
   select: { id: true, slug: true },
  });
  const idToSlug: Record<string, string> = Object.fromEntries(
   frameworks.map((f) => [f.id, f.slug]),
  );

  result.frameworkScores = Object.fromEntries(
   Object.entries(scores as Record<string, number>).map(([k, v]) => [
    idToSlug[k] ?? k,
    v,
   ]),
  );
  return result;
 }

 /** Map selected data scope IDs → frameworks (id + slug) to evaluate. */
 private async resolveFrameworks(
  dataScopes: string[],
 ): Promise<Array<{ id: string; slug: string }>> {
  // Inline mapping (mirrors DataScopesService static list, kept here to avoid
  // a cross-module import for a 4-line lookup).
  const scopeToFrameworkSlugs: Record<string, string[]> = {
   pii: ['gdpr', 'ndpr', 'soc2'],
   phi: ['hipaa', 'soc2'],
   financial: ['pci-dss', 'soc2'],
   general: ['soc2', 'iso27001'],
  };

  const slugSet = new Set<string>();
  for (const scope of dataScopes) {
   const slugs = scopeToFrameworkSlugs[scope] ?? [];
   for (const s of slugs) slugSet.add(s);
  }

  if (slugSet.size === 0) return [];

  const frameworks = await this.prisma.framework.findMany({
   where: { slug: { in: Array.from(slugSet) } },
   select: { id: true, slug: true },
  });

  return frameworks;
 }

 private hashIp(ip: string): string {
  // Salt with a per-deploy constant so hashes don't collide across environments.
  // Using a static salt is fine — this is for abuse correlation, not auth.
  return createHash('sha256').update(`wyzer-guest:${ip}`).digest('hex');
 }
}
