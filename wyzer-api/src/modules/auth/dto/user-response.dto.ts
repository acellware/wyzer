import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @Expose() id!: string;
  @Expose() firstName!: string;
  @Expose() lastName!: string;
  @Expose() email!: string;
  @Expose() emailVerifiedAt!: Date | null;
  @Expose() jobTitle!: string;
  @Expose() country!: string;
  @Expose() createdAt!: Date;
  @Expose() updatedAt!: Date;
}
