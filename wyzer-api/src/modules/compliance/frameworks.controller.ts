import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../common/prisma/prisma.service';

@ApiTags('Frameworks')
@UseGuards(JwtAuthGuard)
@Controller('frameworks')
export class FrameworksController {
 constructor(private readonly prisma: PrismaService) {}

 @Get()
 @ApiOperation({ summary: 'List all compliance frameworks' })
 findAll() {
  return this.prisma.framework.findMany({
   select: { id: true, slug: true, name: true, description: true },
   orderBy: { name: 'asc' },
  });
 }
}
