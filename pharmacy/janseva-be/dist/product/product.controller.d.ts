import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
export declare class ProductController {
    private readonly productService;
    private currentObjectName;
    constructor(productService: ProductService);
    create(data: CreateProductDto): Promise<{
        status: string;
        message: string;
        data: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            createdBy: string;
            updatedBy: string;
            brandId: string;
            categoryId: string;
            uses: string | null;
            tags: string[];
            routeOfAdministration: string | null;
            sideEffects: string | null;
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
            composition: string | null;
            images: string[];
            direction: string | null;
            additionalInfo: string | null;
            slug: string;
            hsnCode: string | null;
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    scrapeProduct(data: {
        medicineName: string;
    }): Promise<import("../utils/scraper").ScrapeResult | {
        status: string;
        message: string;
        data: any;
    }>;
    getAll(page?: number, limit?: number, search?: string): Promise<{
        status: string;
        message: string;
        data: {
            data: {
                id: string;
                name: string;
                slug: string;
                imageUrl: string;
                isPlaceholder: boolean;
                brand: string;
                category: string;
                productVariationsList: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    createdBy: string;
                    updatedBy: string;
                    price: number;
                    discount: number;
                    discountType: string;
                    stock: number;
                    units: number;
                    productId: string;
                }[];
                productVariations: number;
                hasAlternative: string;
                createdBy: string;
                updatedBy: string;
            }[];
            total: number;
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    delete(id: string): Promise<{
        status: string;
        message: any;
        data: any;
    }>;
    deleteMultiple(ids: string[]): Promise<{
        status: string;
        message: any;
        data: any;
    }>;
    update(slug: string, dto: CreateProductDto): Promise<{
        status: string;
        message: string;
        data: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            createdBy: string;
            updatedBy: string;
            brandId: string;
            categoryId: string;
            uses: string | null;
            tags: string[];
            routeOfAdministration: string | null;
            sideEffects: string | null;
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
            composition: string | null;
            images: string[];
            direction: string | null;
            additionalInfo: string | null;
            slug: string;
            hsnCode: string | null;
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    getTags(page?: number, limit?: number, tags?: string): Promise<{
        status: string;
        message: string;
        data: {
            data: {
                id: string;
                name: string;
                slug: string;
                imageUrl: string;
                isPlaceholder: boolean;
                brand: string;
                category: string;
                productVariationsList: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    createdBy: string;
                    updatedBy: string;
                    price: number;
                    discount: number;
                    discountType: string;
                    stock: number;
                    units: number;
                    productId: string;
                }[];
                productVariations: number;
                hasAlternative: string;
                createdBy: string;
                updatedBy: string;
            }[];
            total: number;
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    getTagsSuggestions(search?: string, limit?: string): Promise<{
        status: string;
        message: string;
        data: string[];
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    getBySlug(slug: string): Promise<{
        status: string;
        message: string;
        data: {
            productDetails: {
                images: string[];
                isPlaceholder: boolean;
                brand: string;
                category: string;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                createdBy: string;
                updatedBy: string;
                brandId: string;
                categoryId: string;
                uses: string | null;
                tags: string[];
                routeOfAdministration: string | null;
                sideEffects: string | null;
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
                composition: string | null;
                direction: string | null;
                additionalInfo: string | null;
                slug: string;
                hsnCode: string | null;
            };
            alternativeDetails: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                price: number;
                discount: number;
                discountType: string;
                units: number;
                productName: string;
                productId: string;
                imageUrl: string;
                companyName: string;
                productContent: string;
            };
            variationsDetails: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string;
                updatedBy: string;
                price: number;
                discount: number;
                discountType: string;
                stock: number;
                units: number;
                productId: string;
            }[];
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
}
