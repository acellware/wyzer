import { IsString, IsOptional, MaxLength, MinLength, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStackDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Slug of a stack template to pre-populate items and config answers' })
  @IsOptional()
  @IsString()
  templateSlug?: string;

  @ApiPropertyOptional({ description: 'Data type scopes that drive framework selection (e.g. ["pii", "financial"])' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dataScopes?: string[];
}
