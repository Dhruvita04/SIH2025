import {
  IsString,
} from 'class-validator';

export class DeleteCartItemDto {
  @IsString()
  userId: string;

  @IsString()
  productId: string;

  @IsString()
  variantId: string;
}
