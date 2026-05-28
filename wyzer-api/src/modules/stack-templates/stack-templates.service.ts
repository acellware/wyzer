import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StackTemplatesRepository } from './stack-templates.repository';
import { resolveLogoUrl } from '../technologies/technologies.repository';

@Injectable()
export class StackTemplatesService {
 constructor(
  private readonly repo: StackTemplatesRepository,
  private readonly prisma: PrismaService,
 ) {}

 async findAll() {
  const templates = await this.repo.findAll();

  // Expand preview_tech_slugs to full technology objects
  // The templateData.items contains technologyId; we also return lightweight preview data
  return Promise.all(
   templates.map(async (tmpl) => {
    const templateData = tmpl.templateData as {
     items: Array<{
      technologyId: string;
      deploymentMode: string;
      configAnswers: Record<string, string>;
     }>;
    };

    const techIds = templateData.items.map((i) => i.technologyId);
    const technologies = await this.prisma.technology.findMany({
     where: { id: { in: techIds } },
     select: { id: true, slug: true, name: true, logoUrl: true },
    });

    const previewTechnologies = technologies.map((t) => ({
     ...t,
     logoUrl: resolveLogoUrl(t.slug) ?? t.logoUrl,
    }));

    return {
     id: tmpl.id,
     slug: tmpl.slug,
     name: tmpl.name,
     description: tmpl.description,
     useCase: tmpl.useCase,
     dataScopes: tmpl.dataScopes,
     previewTechnologies,
     templateData,
     createdAt: tmpl.createdAt,
    };
   }),
  );
 }

 async findBySlug(slug: string) {
  const tmpl = await this.repo.findBySlug(slug);
  if (!tmpl) throw new NotFoundException(`Stack template '${slug}' not found`);
  return tmpl;
 }
}
