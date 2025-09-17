import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProductVariationDto {
  @IsOptional()
  @IsString()
  id?: string

  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  discount: number;

  @IsString()
  discountType: string;

  @IsNumber()
  stock: number;

  @IsNumber()
  units: number;
}

class ProductAlternativeDto {
  @IsString()
  productAlternativeName: string;

  @IsString()
  productAlternativeCompanyName: string;

  @IsString()
  productAlternativeContent: string;

  @IsNumber()
  productAlternativePrice: number;

  @IsNumber()
  productAlternativeDiscount: number;

  @IsString()
  productAlternativeDiscountType: string;

  @IsNumber()
  productAlternativeUnits: number;
}


export class CreateProductDto {
  @IsString()
  productName: string;

  @IsString()
  productSlug: string;

  @IsOptional()
  @IsString()
  productDescription?: string;

  @IsString()
  brandId: string;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  uses?: string;

  @IsOptional()
  @IsString()
  productDirections?: string;

  @IsOptional()
  @IsString()
  productRouteOfAdministration?: string;
  
  @IsOptional()
  @IsString()
  productSideEffects?: string;

  @IsOptional()
  @IsString()
  productMedActivity?: string;

  @IsOptional()
  @IsString()
  productPrecaution?: string;

  @IsOptional()
  @IsString()
  productInteractions?: string;

  @IsOptional()
  @IsString()
  productDosageInformation?: string;

  @IsOptional()
  @IsString()
  productStorage?: string;

  @IsOptional()
  @IsString()
  productDietAndLifestyleGuidance?: string;

  @IsOptional()
  @IsString()
  productHighlights?: string;

  @IsOptional()
  @IsString()
  productIngredients?: string;

  @IsOptional()
  @IsString()
  productKeyUses?: string;

  @IsOptional()
  @IsString()
  productHowToUse?: string;

  @IsOptional()
  @IsString()
  productSafetyInformation?: string;

  @IsOptional()
  @IsString()
  productAdditionalInfo?: string;

  @IsOptional()
  @IsString()
  productComposition?: string;

  @IsOptional()
  @IsString()
  productHsnCode?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariationDto)
  productVariations: ProductVariationDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productImages?: string[];

  @IsBoolean()
  hasAlternativeProduct: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductAlternativeDto)
  productAlternatives?: ProductAlternativeDto;

  @IsOptional()
  @IsString()
  productAlternativeImage?: string;
}
