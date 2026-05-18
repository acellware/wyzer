import { ApiProperty } from '@nestjs/swagger';
import { CompanySize } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsISO31661Alpha2,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Jane' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ example: 'jane@acme.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  /** The user's job title — stored in users.job_title, not to be confused with org role. */
  @ApiProperty({ example: 'Head of Engineering' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  jobTitle!: string;

  @ApiProperty({ example: 'US', description: 'ISO 3166-1 alpha-2 country code' })
  @IsISO31661Alpha2()
  country!: string;

  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  orgName!: string;

  @ApiProperty({ enum: CompanySize })
  @IsEnum(CompanySize)
  companySize!: CompanySize;
}
