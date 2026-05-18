import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class StackTemplatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.stackTemplate.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.stackTemplate.findUnique({ where: { slug } });
  }
}
