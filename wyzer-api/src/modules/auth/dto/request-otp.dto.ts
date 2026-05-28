import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class RequestOtpDto {
 @ApiProperty({ example: 'jane@acme.com' })
 @IsEmail()
 email!: string;

 @ApiPropertyOptional({ example: 'Jane Doe' })
 @IsOptional()
 @IsString()
 @MaxLength(200)
 name?: string;

 @ApiPropertyOptional({ example: 'Acme Corp' })
 @IsOptional()
 @IsString()
 @MaxLength(200)
 orgName?: string;

 @ApiPropertyOptional({ example: 'Head of Engineering' })
 @IsOptional()
 @IsString()
 @MaxLength(200)
 jobTitle?: string;
}
