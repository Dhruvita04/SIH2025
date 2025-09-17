import { ProfileService } from './profile.service';
import { ProfileDto } from './dto/profile.dto';
import { Multer } from 'multer';
export declare class ProfileController {
    private readonly profileService;
    constructor(profileService: ProfileService);
    create(userId: string, dto: ProfileDto, file: Multer.File): Promise<{
        status: string;
        message: string;
        data: {
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
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    getById(userId: string): Promise<{
        status: string;
        message: string;
        data: {
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
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
}
