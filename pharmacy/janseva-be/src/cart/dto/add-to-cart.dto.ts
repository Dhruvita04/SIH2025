import {
  IsNumber,
  IsString,
} from 'class-validator';

export class AddToCartDto {
  @IsString()
  userId: string;

  @IsString() 
  productId: string;

  @IsString()
  variantId: string;

  @IsNumber()
  quantity: number;
}
