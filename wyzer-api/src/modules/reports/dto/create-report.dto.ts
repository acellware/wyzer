import { IsArray, IsString, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({ description: 'Stack ID to assess' })
  @IsString()
  stackId!: string;

  @ApiProperty({
    description: 'Framework IDs to include in the assessment',
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  frameworkIds!: string[];
}
