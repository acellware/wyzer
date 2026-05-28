import {
 Body,
 Controller,
 Delete,
 Get,
 HttpCode,
 HttpStatus,
 Param,
 Patch,
 Post,
 Put,
 UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Plan } from '@prisma/client';
import { StacksService } from './stacks.service';
import { CreateStackDto } from './dto/create-stack.dto';
import { UpdateStackDto } from './dto/update-stack.dto';
import { AddStackItemDto } from './dto/add-stack-item.dto';
import { PatchStackItemDto } from './dto/patch-stack-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Stacks')
@UseGuards(JwtAuthGuard)
@Controller('stacks')
export class StacksController {
 constructor(private readonly service: StacksService) {}

 @Post()
 @ApiOperation({ summary: 'Create a new stack' })
 create(
  @CurrentUser('orgId') orgId: string,
  @CurrentUser('sub') userId: string,
  @CurrentUser('plan') plan: Plan,
  @Body() dto: CreateStackDto,
 ) {
  return this.service.create(orgId, dto, userId, plan);
 }

 @Get()
 @ApiOperation({ summary: "List all stacks for the caller's organisation" })
 findAll(@CurrentUser('orgId') orgId: string) {
  return this.service.findAll(orgId);
 }

 @Get(':id')
 @ApiOperation({ summary: 'Get a stack by ID with its items' })
 findOne(@CurrentUser('orgId') orgId: string, @Param('id') id: string) {
  return this.service.findOne(id, orgId);
 }

 @Put(':id')
 @ApiOperation({ summary: 'Update stack name/description' })
 update(
  @CurrentUser('orgId') orgId: string,
  @Param('id') id: string,
  @Body() dto: UpdateStackDto,
 ) {
  return this.service.update(id, orgId, dto);
 }

 @Delete(':id')
 @HttpCode(HttpStatus.NO_CONTENT)
 @ApiOperation({ summary: 'Delete a stack' })
 delete(
  @CurrentUser('orgId') orgId: string,
  @CurrentUser('sub') userId: string,
  @Param('id') id: string,
 ) {
  return this.service.delete(id, orgId, userId);
 }

 @Post(':id/items')
 @ApiOperation({ summary: 'Add a technology to a stack' })
 addItem(
  @CurrentUser('orgId') orgId: string,
  @Param('id') id: string,
  @Body() dto: AddStackItemDto,
 ) {
  return this.service.addItem(id, orgId, dto);
 }

 @Patch(':id/items/:technologyId')
 @ApiOperation({
  summary: 'Update configAnswers or deploymentMode on a stack item',
 })
 patchItem(
  @CurrentUser('orgId') orgId: string,
  @Param('id') id: string,
  @Param('technologyId') technologyId: string,
  @Body() dto: PatchStackItemDto,
 ) {
  return this.service.patchItem(id, orgId, technologyId, dto);
 }

 @Delete(':id/items/:technologyId')
 @HttpCode(HttpStatus.NO_CONTENT)
 @ApiOperation({ summary: 'Remove a technology from a stack' })
 removeItem(
  @CurrentUser('orgId') orgId: string,
  @Param('id') id: string,
  @Param('technologyId') technologyId: string,
 ) {
  return this.service.removeItem(id, orgId, technologyId);
 }
}
