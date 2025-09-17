export interface productOption {
    id: number;
    price: number;
    units: number;
    name: string;
    stock: number;
    discount: number;
    discountType: string
}

export interface ProductDetails {
    id: string;
    name: string;
    slug: string;
    description: string;
    images: string[];
    categoryId: string;
    brandId: string;
    uses: string;
    direction: string;
    routeOfAdministration: string | null;
    sideEffects: string;
    medActivity: string | null;
    precaution: string | null;
    interactions: string | null;
    dosageInformation: string | null;
    storage: string | null;
    dietAndLifestyleGuidance: string | null;
    highlights: string | null;
    ingredients: string | null;
    keyUses: string | null;
    howToUse: string | null;
    safetyInformation: string | null;
    additionalInfo: string;
    composition: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    brand: string;
    category: string;
}

export interface AlternativeProduct {
    id: string;
    productId: string;
    imageUrl: string;
    productName: string;
    companyName: string;
    productContent: string;
    price: number;
    discount: number;
    discountType: string;
    units: number;
    createdAt: string;
    updatedAt: string;
}

export interface ProductVariation {
    id: string;
    productId: string;
    name: string;
    price: number;
    discount: number;
    discountType: string;
    units: number;
    stock: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}