import { IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';

export class CreateInviteDto {
  @ApiProperty({ example: 'alice@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: MemberRole, default: MemberRole.MEMBER })
  @IsEnum(MemberRole)
  role: MemberRole = MemberRole.MEMBER;
}
