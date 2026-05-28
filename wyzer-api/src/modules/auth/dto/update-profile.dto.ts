import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
 @ApiPropertyOptional({ example: 'Alice' })
 @IsOptional()
 @IsString()
 @MaxLength(100)
 firstName?: string;

 @ApiPropertyOptional({ example: 'Smith' })
 @IsOptional()
 @IsString()
 @MaxLength(100)
 lastName?: string;

 @ApiPropertyOptional({ example: 'CTO' })
 @IsOptional()
 @IsString()
 @MaxLength(200)
 jobTitle?: string;
}
