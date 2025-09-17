import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Multer } from 'multer';
export declare class CategoryController {
    private readonly categoryService;
    private currentObjectName;
    private currentObjectNamePlural;
    constructor(categoryService: CategoryService);
    create(dto: CreateCategoryDto, file: Multer.File): Promise<{
        status: string;
        message: string;
        data: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            logoUrl: string | null;
            createdBy: string;
            updatedBy: string;
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    getPublicCategories(limit: number, offset: number): Promise<{
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
    update(id: string, dto: UpdateCategoryDto, file?: Multer.File): Promise<{
        status: string;
        message: string;
        data: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            logoUrl: string | null;
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
