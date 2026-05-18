import { IsObject, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DeploymentMode } from '@prisma/client';

export class PatchStackItemDto {
  @ApiPropertyOptional({ description: 'Updated config answers for this stack item' })
  @IsOptional()
  @IsObject()
  configAnswers?: Record<string, string>;

  @ApiPropertyOptional({ enum: DeploymentMode })
  @IsOptional()
  @IsEnum(DeploymentMode)
  deploymentMode?: DeploymentMode;
}
