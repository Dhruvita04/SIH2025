import {
    IsNumber,
    IsString,
} from 'class-validator';

export class UpdateCartItemDto {
    @IsString()
    userId: string;

    @IsString()
    productId: string;

    @IsString()
    variantId: string;

    @IsNumber()
    quantity: number;
}

