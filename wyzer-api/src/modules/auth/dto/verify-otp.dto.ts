import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
 @ApiProperty({ example: 'jane@acme.com' })
 @IsEmail()
 email!: string;

 @ApiProperty({ example: '483921', description: '6-digit code sent to email' })
 @IsString()
 @Length(6, 6, { message: 'Code must be exactly 6 digits' })
 code!: string;
}
