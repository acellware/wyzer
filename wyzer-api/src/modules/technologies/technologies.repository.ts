import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { QueryTechnologiesDto } from './dto/query-technologies.dto';
import { Prisma, DeploymentMode } from '@prisma/client';

@Injectable()
export class TechnologiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(dto: QueryTechnologiesDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.TechnologyWhereInput = {};

    if (dto.category) {
      where.category = { equals: dto.category, mode: 'insensitive' };
    }

    if (dto.search) {
      where.OR = [
        { name: { contains: dto.search, mode: 'insensitive' } },
        { category: { contains: dto.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.technology.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          slug: true,
          name: true,
          category: true,
          logoUrl: true,
          createdAt: true,
        },
      }),
      this.prisma.technology.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findBySlug(slug: string) {
    return this.prisma.technology.findUnique({
      where: { slug },
      include: {
        controlMappings: {
          include: {
            control: {
              include: { framework: true },
            },
          },
        },
      },
    });
  }

  async findConfigQuestions(technologyId: string, deploymentMode?: DeploymentMode) {
    const where: Prisma.TechnologyConfigQuestionWhereInput = { technologyId };

    if (deploymentMode) {
      where.appliesToModes = { has: deploymentMode };
    }

    return this.prisma.technologyConfigQuestion.findMany({
      where,
      orderBy: { orderIndex: 'asc' },
    });
  }
}
