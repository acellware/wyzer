import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CompleteSignupDto {
 @ApiProperty({
  description:
   'Short-lived token returned from POST /auth/otp/verify for new users',
 })
 @IsString()
 @IsNotEmpty()
 onboardingToken!: string;

 @ApiProperty({ example: 'Acme Corp' })
 @IsString()
 @IsNotEmpty()
 @MaxLength(200)
 orgName!: string;

 @ApiProperty({ example: 'Head of Engineering' })
 @IsString()
 @IsNotEmpty()
 @MaxLength(200)
 jobTitle!: string;
}
