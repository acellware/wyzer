import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WaitlistDto {
  @ApiProperty({ example: 'founder@startup.io' })
  @IsEmail()
  email!: string;
}
