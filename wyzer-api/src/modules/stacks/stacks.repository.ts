import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateStackDto } from './dto/create-stack.dto';
import { UpdateStackDto } from './dto/update-stack.dto';
import { AddStackItemDto } from './dto/add-stack-item.dto';
import { PatchStackItemDto } from './dto/patch-stack-item.dto';

@Injectable()
export class StacksRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(organisationId: string, dto: CreateStackDto) {
    return this.prisma.stack.create({
      data: {
        organisationId,
        name: dto.name,
        description: dto.description,
        dataScopes: dto.dataScopes ?? [],
      },
      include: { items: { include: { technology: true } } },
    });
  }

  findAllByOrg(organisationId: string) {
    return this.prisma.stack.findMany({
      where: { organisationId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { technology: true } },
        _count: { select: { reports: true } },
      },
    });
  }

  countByOrg(organisationId: string) {
    return this.prisma.stack.count({ where: { organisationId } });
  }

  findOne(id: string, organisationId: string) {
    return this.prisma.stack.findFirst({
      where: { id, organisationId },
      include: {
        items: { include: { technology: true } },
        reports: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
  }

  update(id: string, organisationId: string, dto: UpdateStackDto) {
    return this.prisma.stack.updateMany({
      where: { id, organisationId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.dataScopes !== undefined && { dataScopes: dto.dataScopes }),
      },
    });
  }

  delete(id: string, organisationId: string) {
    return this.prisma.stack.deleteMany({ where: { id, organisationId } });
  }

  addItem(stackId: string, dto: AddStackItemDto) {
    return this.prisma.stackItem.create({
      data: {
        stackId,
        technologyId: dto.technologyId,
        deploymentMode: dto.deploymentMode,
        configAnswers: dto.configAnswers ?? {},
      },
      include: { technology: true },
    });
  }

  patchItem(stackId: string, technologyId: string, dto: PatchStackItemDto) {
    return this.prisma.stackItem.updateMany({
      where: { stackId, technologyId },
      data: {
        ...(dto.configAnswers !== undefined && { configAnswers: dto.configAnswers }),
        ...(dto.deploymentMode !== undefined && { deploymentMode: dto.deploymentMode }),
      },
    });
  }

  removeItem(stackId: string, technologyId: string) {
    return this.prisma.stackItem.deleteMany({
      where: { stackId, technologyId },
    });
  }

  findTemplate(slug: string) {
    return this.prisma.stackTemplate.findUnique({ where: { slug } });
  }
}

