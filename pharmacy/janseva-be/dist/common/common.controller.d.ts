import { CommonService } from './common.service';
export declare class CommonController {
    private readonly commonService;
    private currentObjectName;
    constructor(commonService: CommonService);
    getSearchBarProducts(page?: number, limit?: number, search?: string): Promise<{
        status: string;
        message: string;
        data: any[];
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    getSearchPageProducts(body: {
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
    }): Promise<{
        status: string;
        message: string;
        data: {
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
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    getFilters(): Promise<{
        status: string;
        message: string;
        data: {
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
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
}
