import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Multer } from 'multer';
export declare class BrandController {
    private readonly brandService;
    private currentObjectName;
    constructor(brandService: BrandService);
    create(dto: CreateBrandDto, file: Multer.File): Promise<{
        status: string;
        message: string;
        data: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            logoUrl: string | null;
            websiteUrl: string | null;
            createdBy: string;
            updatedBy: string;
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    getPublicBrands(limit: number, offset: number): Promise<{
        status: string;
        message: string;
        data: {
            data: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                logoUrl: string | null;
                websiteUrl: string | null;
                createdBy: string;
                updatedBy: string;
            }[];
            totalCount: number;
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    getAll(): Promise<{
        status: string;
        message: string;
        data: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            logoUrl: string | null;
            websiteUrl: string | null;
            createdBy: string;
            updatedBy: string;
        }[];
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    getById(id: string): Promise<{
        status: string;
        message: string;
        data: {
            id: string;
            name: string;
            description: string;
            logo: {
                url: string;
                path: string;
                file: any;
            };
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    update(id: string, dto: UpdateBrandDto, file?: Multer.File): Promise<{
        status: string;
        message: string;
        data: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            logoUrl: string | null;
            websiteUrl: string | null;
            createdBy: string;
            updatedBy: string;
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
}
