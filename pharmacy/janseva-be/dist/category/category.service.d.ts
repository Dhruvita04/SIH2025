import { PrismaService } from '../prisma/prisma.service';
import { ImageService } from '../utils/image.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Multer } from 'multer';
export declare class CategoryService {
    private prisma;
    private imageService;
    constructor(prisma: PrismaService, imageService: ImageService);
    createCategory(dto: CreateCategoryDto, file: Multer.File): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        logoUrl: string | null;
        createdBy: string;
        updatedBy: string;
    }>;
    getAllCategories(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        logoUrl: string | null;
        createdBy: string;
        updatedBy: string;
    }[]>;
    getPublicCategories(limit: number, offset: number): Promise<{
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
    }>;
    getCategoryById(id: string, currentObjectName: string): Promise<{
        id: string;
        name: string;
        description: string;
        logo: {
            url: string;
            path: string;
            file: any;
        };
    }>;
    updateCategory(id: string, dto: UpdateCategoryDto, file?: Multer.File): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        logoUrl: string | null;
        createdBy: string;
        updatedBy: string;
    }>;
    deleteCategory(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        logoUrl: string | null;
        createdBy: string;
        updatedBy: string;
    }>;
    deleteMultipleCategories(ids: string[], currentObjectNamePlural: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getImageName(name: string): string;
}
