import { BrandService } from "src/brand/brand.service";
import { CategoryService } from "src/category/category.service";
import { PrismaService } from "src/prisma/prisma.service";
import { ProductService } from "src/product/product.service";
interface SearchRequest {
    query?: string;
    brands?: string[];
    categories?: string[];
    price?: {
        min: number;
        max: number;
    };
    sort?: string;
    page?: number;
    limit?: number;
}
export declare class CommonService {
    private productService;
    private categoryService;
    private brandService;
    private prismaService;
    constructor(productService: ProductService, categoryService: CategoryService, brandService: BrandService, prismaService: PrismaService);
    private getPlaceholderImageBase64;
    getSearchBarResults(page: number, limit: number, search: string): Promise<any[]>;
    getProductsBySearchTerm(search: string): Promise<{
        name: string;
        images: string[];
        slug: string;
    }[]>;
    getCategoriesBySearchTerm(search: string): Promise<{
        name: string;
        logoUrl: string;
    }[]>;
    getBrandsBySearchTerm(search: string): Promise<{
        name: string;
        logoUrl: string;
    }[]>;
    getSearchPageResults(searchRequest: SearchRequest): Promise<{
        products: {
            images: string[];
            imageUrl: string;
            isPlaceholder: boolean;
            brand: {
                name: string;
                id: string;
            };
            category: {
                name: string;
                id: string;
            };
            variants: {
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
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    private isPriceSorting;
    private sortByPrice;
    private getLowestVariantPrice;
    private buildOrderBy;
    getFilters(): Promise<{
        categories: {
            name: string;
            id: string;
        }[];
        brands: {
            name: string;
            id: string;
        }[];
        price: {
            min: number;
            max: number;
        };
    }>;
}
export {};
