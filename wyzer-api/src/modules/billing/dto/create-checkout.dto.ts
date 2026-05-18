import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum BillingPlan {
  PRO = 'pro',
  TEAM = 'team',
}

export class CreateCheckoutDto {
  @ApiProperty({ enum: BillingPlan })
  @IsEnum(BillingPlan)
  plan!: BillingPlan;
}
