import { PrismaService } from '../prisma/prisma.service';
import { ImageService } from '../utils/image.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Multer } from 'multer';
export declare class BrandService {
    private prisma;
    private imageService;
    constructor(prisma: PrismaService, imageService: ImageService);
    createBrand(dto: CreateBrandDto, file: Multer.File, currentObjectName: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        logoUrl: string | null;
        websiteUrl: string | null;
        createdBy: string;
        updatedBy: string;
    }>;
    getPublicBrands(limit: number, offset: number): Promise<{
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
    }>;
    getAllBrands(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        logoUrl: string | null;
        websiteUrl: string | null;
        createdBy: string;
        updatedBy: string;
    }[]>;
    getBrandById(id: string, currentObjectName: string): Promise<{
        id: string;
        name: string;
        description: string;
        logo: {
            url: string;
            path: string;
            file: any;
        };
    }>;
    updateBrand(id: string, dto: UpdateBrandDto, currentObjectName: string, file?: Multer.File): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        logoUrl: string | null;
        websiteUrl: string | null;
        createdBy: string;
        updatedBy: string;
    }>;
    deleteBrand(id: string, currentObjectName: string): Promise<void>;
    deleteMultipleBrands(ids: string[], currentObjectName: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getImageName(name: string): string;
}
