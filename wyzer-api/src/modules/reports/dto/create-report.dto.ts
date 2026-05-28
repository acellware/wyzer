import { IsArray, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
 @ApiProperty({ description: 'Stack ID to assess' })
 @IsString()
 stackId!: string;

 @ApiPropertyOptional({
  description:
   'Framework IDs to assess against. Omit or pass [] to run against all frameworks.',
  type: [String],
 })
 @IsOptional()
 @IsArray()
 @IsString({ each: true })
 frameworkIds?: string[];
}
