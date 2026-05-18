import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TechnologiesService } from './technologies.service';
import { QueryTechnologiesDto } from './dto/query-technologies.dto';
import { ConfigQuestionsQueryDto } from './dto/config-questions-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeploymentMode } from '@prisma/client';

@ApiTags('Technologies')
@UseGuards(JwtAuthGuard)
@Controller('technologies')
export class TechnologiesController {
  constructor(private readonly service: TechnologiesService) {}

  @Get()
  @ApiOperation({ summary: 'List all technologies (paginated, filterable)' })
  findAll(@Query() dto: QueryTechnologiesDto) {
    return this.service.findMany(dto);
  }

  @Get(':id/config-questions')
  @ApiOperation({ summary: 'Get config questions for a technology, filtered by deployment mode' })
  getConfigQuestions(
    @Param('id') id: string,
    @Query() dto: ConfigQuestionsQueryDto,
  ) {
    const mode = dto.deploymentMode as DeploymentMode | undefined;
    return this.service.getConfigQuestions(id, mode);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a single technology with its control mappings' })
  findOne(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }
}
