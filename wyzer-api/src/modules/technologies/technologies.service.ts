import { Injectable, NotFoundException } from '@nestjs/common';
import { TechnologiesRepository } from './technologies.repository';
import { QueryTechnologiesDto } from './dto/query-technologies.dto';
import { DeploymentMode } from '@prisma/client';

@Injectable()
export class TechnologiesService {
  constructor(private readonly repo: TechnologiesRepository) {}

  async findMany(dto: QueryTechnologiesDto) {
    const { data, total, page, limit } = await this.repo.findMany(dto);
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    const tech = await this.repo.findBySlug(slug);
    if (!tech) throw new NotFoundException(`Technology '${slug}' not found`);
    return tech;
  }

  async getConfigQuestions(technologyId: string, deploymentMode?: DeploymentMode) {
    const questions = await this.repo.findConfigQuestions(technologyId, deploymentMode);
    // Inject "not_sure" option at response time — never stored in DB
    return questions.map((q) => ({
      ...q,
      options: [
        ...(Array.isArray(q.options) ? (q.options as Array<{ value: string; label: string }>) : []),
        { value: 'not_sure', label: "Not sure" },
      ],
    }));
  }
}
