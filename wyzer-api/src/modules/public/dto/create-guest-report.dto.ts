import {
 ArrayMaxSize,
 ArrayMinSize,
 IsArray,
 IsEmail,
 IsEnum,
 IsObject,
 IsOptional,
 IsString,
 Length,
 ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeploymentMode } from '@prisma/client';

export class GuestSelectionDto {
 @ApiProperty()
 @IsString()
 technologyId!: string;

 @ApiProperty({ enum: DeploymentMode })
 @IsEnum(DeploymentMode)
 deploymentMode!: DeploymentMode;

 /** signalKey → answer value (e.g. { encryption_at_rest: "yes" }) */
 @ApiPropertyOptional({ type: Object })
 @IsOptional()
 @IsObject()
 configAnswers?: Record<string, string>;
}

export class CreateGuestReportDto {
 // ── Lead capture ──────────────────────────────────────────────────────────
 @ApiProperty()
 @IsString()
 @Length(1, 120)
 companyName!: string;

 @ApiProperty()
 @IsEmail()
 @Length(3, 254)
 email!: string;

 @ApiPropertyOptional()
 @IsOptional()
 @IsString()
 @Length(1, 80)
 role?: string;

 // ── Stack input ───────────────────────────────────────────────────────────
 @ApiPropertyOptional()
 @IsOptional()
 @IsString()
 @Length(1, 120)
 stackName?: string;

 @ApiProperty({ type: [String] })
 @IsArray()
 @ArrayMinSize(1)
 @ArrayMaxSize(8)
 @IsString({ each: true })
 dataScopes!: string[];

 @ApiProperty({ type: [GuestSelectionDto] })
 @IsArray()
 @ArrayMinSize(1)
 @ArrayMaxSize(40)
 @ValidateNested({ each: true })
 @Type(() => GuestSelectionDto)
 selections!: GuestSelectionDto[];

 // ── UTM / referrer (optional, client-supplied) ────────────────────────────
 @ApiPropertyOptional()
 @IsOptional()
 @IsString()
 @Length(1, 120)
 utmSource?: string;

 @ApiPropertyOptional()
 @IsOptional()
 @IsString()
 @Length(1, 120)
 utmMedium?: string;

 @ApiPropertyOptional()
 @IsOptional()
 @IsString()
 @Length(1, 120)
 utmCampaign?: string;
}
