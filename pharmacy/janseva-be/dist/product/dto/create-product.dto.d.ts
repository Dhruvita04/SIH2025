declare class ProductVariationDto {
    id?: string;
    name: string;
    price: number;
    discount: number;
    discountType: string;
    stock: number;
    units: number;
}
declare class ProductAlternativeDto {
    productAlternativeName: string;
    productAlternativeCompanyName: string;
    productAlternativeContent: string;
    productAlternativePrice: number;
    productAlternativeDiscount: number;
    productAlternativeDiscountType: string;
    productAlternativeUnits: number;
}
export declare class CreateProductDto {
    productName: string;
    productSlug: string;
    productDescription?: string;
    brandId: string;
    categoryId: string;
    uses?: string;
    productDirections?: string;
    productRouteOfAdministration?: string;
    productSideEffects?: string;
    productMedActivity?: string;
    productPrecaution?: string;
    productInteractions?: string;
    productDosageInformation?: string;
    productStorage?: string;
    productDietAndLifestyleGuidance?: string;
    productHighlights?: string;
    productIngredients?: string;
    productKeyUses?: string;
    productHowToUse?: string;
    productSafetyInformation?: string;
    productAdditionalInfo?: string;
    productComposition?: string;
    productHsnCode?: string;
    tags?: string[];
    productVariations: ProductVariationDto[];
    productImages?: string[];
    hasAlternativeProduct: boolean;
    productAlternatives?: ProductAlternativeDto;
    productAlternativeImage?: string;
}
export {};
