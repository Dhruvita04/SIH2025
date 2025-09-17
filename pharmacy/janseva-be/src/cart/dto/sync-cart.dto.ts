import {
  IsArray,
  IsNumber,
  IsString,
  IsOptional,
} from 'class-validator';

export class SyncCartDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  prescriptionId?: string;

  @IsArray()
  data: {
    productId: string;
    quantity: number;
    variantId: string;
  }[];
}
