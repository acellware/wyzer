import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StackTemplatesService } from './stack-templates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Stack Templates')
@UseGuards(JwtAuthGuard)
@Controller('stack-templates')
export class StackTemplatesController {
  constructor(private readonly service: StackTemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'List all stack templates with expanded preview technologies' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a stack template by slug including full template_data' })
  findOne(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }
}
