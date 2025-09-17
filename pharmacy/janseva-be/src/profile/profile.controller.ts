import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    UploadedFile,
    UseInterceptors,
    UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileDto } from './dto/profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('profile')
export class ProfileController {

    constructor(private readonly profileService: ProfileService) {
    }

    @UseGuards(JwtAuthGuard)
    @Post(':userId')
    @UseInterceptors(FileInterceptor('profileImage'))
    async create(
        @Param('userId') userId: string,
        @Body() dto: ProfileDto,
        @UploadedFile() file: Multer.File,
    ) {
        try {
            if (!file) {
                throw new Error('No file uploaded');
            }
            const response = await this.profileService.handleProfile(userId, dto, file);
            return {
                status: 'success',
                message: 'Profile created successfully',
                data: response
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get(':userId')
    async getById(@Param('userId') userId: string) {
        try {
            const profile = await this.profileService.getProfile(userId);
            return {
                status: 'success',
                message: 'Profile retrieved successfully',
                data: profile
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    }

}
