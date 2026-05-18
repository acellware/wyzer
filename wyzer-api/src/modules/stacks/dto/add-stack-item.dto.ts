import { IsEnum, IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeploymentMode } from '@prisma/client';

export class AddStackItemDto {
  @ApiProperty({ description: 'Technology ID (cuid)' })
  @IsString()
  technologyId!: string;

  @ApiProperty({ enum: DeploymentMode })
  @IsEnum(DeploymentMode)
  deploymentMode!: DeploymentMode;

  @ApiPropertyOptional({ description: 'Signal-key → answer map for this technology\'s config questions' })
  @IsOptional()
  @IsObject()
  configAnswers?: Record<string, string>;
}
