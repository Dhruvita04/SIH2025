import { PrismaService } from '../prisma/prisma.service';
import { ImageService } from '../utils/image.service';
import { ProfileDto } from './dto/profile.dto';
import { Multer } from 'multer';
export declare class ProfileService {
    private prisma;
    private imageService;
    constructor(prisma: PrismaService, imageService: ImageService);
    getProfile(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        userId: string;
        firstName: string;
        lastName: string;
        age: number;
        gender: string;
        profileImageUrl: string | null;
    }>;
    handleProfile(userId: string, dto: ProfileDto, file?: Multer.File): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        userId: string;
        firstName: string;
        lastName: string;
        age: number;
        gender: string;
        profileImageUrl: string | null;
    }>;
    getImageName(name: string): string;
}
