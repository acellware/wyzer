import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
 @Expose() id!: string;
 @Expose() firstName!: string | null;
 @Expose() lastName!: string | null;
 @Expose() email!: string;
 @Expose() emailVerifiedAt!: Date | null;
 @Expose() jobTitle!: string | null;
 @Expose() country!: string | null;
 @Expose() createdAt!: Date;
 @Expose() updatedAt!: Date;
}
