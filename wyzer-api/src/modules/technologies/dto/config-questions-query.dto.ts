import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DeploymentMode } from '@prisma/client';

export class ConfigQuestionsQueryDto {
  @ApiPropertyOptional({ enum: DeploymentMode, description: 'Filter questions by deployment mode' })
  @IsOptional()
  @IsEnum(DeploymentMode)
  deploymentMode?: DeploymentMode;
}
