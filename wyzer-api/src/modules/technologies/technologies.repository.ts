import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { QueryTechnologiesDto } from './dto/query-technologies.dto';
import { Prisma, DeploymentMode } from '@prisma/client';

/** Maps our technology slugs to SimpleIcons icon names for CDN logo resolution.
 *  Uses jsDelivr npm CDN which mirrors the full simple-icons package, including
 *  all Amazon/AWS service icons that are absent from cdn.simpleicons.org. */
const SIMPLEICONS_MAP: Record<string, string> = {
 ansible: 'ansible',
 argocd: 'argo',
 'aws-ec2': 'amazonec2',
 'aws-ecs': 'amazonecs',
 'aws-eks': 'amazoneks',
 'aws-lambda': 'awslambda',
 'aws-s3': 'amazons3',
 'aws-secrets-manager': 'awssecretsmanager',
 'aws-waf': 'amazonaws',
 azure: 'microsoftazure',
 circleci: 'circleci',
 cloudflare: 'cloudflare',
 cockroachdb: 'cockroachlabs',
 datadog: 'datadog',
 digitalocean: 'digitalocean',
 docker: 'docker',
 elasticsearch: 'elasticsearch',
 flyio: 'flyio',
 gcp: 'googlecloud',
 'github-actions': 'githubactions',
 grafana: 'grafana',
 'hashicorp-vault': 'vault',
 kafka: 'apachekafka',
 kubernetes: 'kubernetes',
 mongodb: 'mongodb',
 mysql: 'mysql',
 nats: 'natsdotio',
 'neon-postgresql': 'neon',
 nginx: 'nginx',
 planetscale: 'planetscale',
 postgresql: 'postgresql',
 rabbitmq: 'rabbitmq',
 redis: 'redis',
 terraform: 'terraform',
 'upstash-redis': 'upstash',
 vercel: 'vercel',
};

const JSDELIVR_BASE = 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons';

export function resolveLogoUrl(slug: string): string | null {
 const icon = SIMPLEICONS_MAP[slug];
 return icon ? `${JSDELIVR_BASE}/${icon}.svg` : null;
}

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

  const resolved = data.map((t) => ({
   ...t,
   logoUrl: resolveLogoUrl(t.slug) ?? t.logoUrl,
  }));

  return { data: resolved, total, page, limit };
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

 async findConfigQuestions(
  technologyId: string,
  deploymentMode?: DeploymentMode,
 ) {
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
