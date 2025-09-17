"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const image_service_1 = require("../utils/image.service");
let ProfileService = class ProfileService {
    constructor(prisma, imageService) {
        this.prisma = prisma;
        this.imageService = imageService;
    }
    async getProfile(userId) {
        try {
            const profile = await this.prisma.userProfile.findUnique({
                where: {
                    userId: userId
                }
            });
            if (profile?.profileImageUrl) {
                profile.profileImageUrl = await this.imageService.getSignedUrl('profiles', profile.profileImageUrl, parseInt(process.env.SIGNED_URL_DURATION_IN_MINUTES || '60'));
            }
            return profile;
        }
        catch (error) {
            throw new common_1.NotFoundException('Profile not found');
        }
    }
    async handleProfile(userId, dto, file) {
        try {
            let profileImageUrl = null;
            if (file) {
                profileImageUrl = await this.imageService.uploadImage('profiles', `${userId}`, file.mimetype.toString(), file.buffer);
            }
            const profile = await this.prisma.userProfile.findUnique({
                where: { userId }
            });
            if (!profile) {
                const newProfile = await this.prisma.userProfile.create({
                    data: {
                        firstName: dto.firstName || '',
                        lastName: dto.lastName || '',
                        age: parseInt(dto.age.toString()) || 0,
                        gender: dto.gender || '',
                        phone: dto.phone || '',
                        profileImageUrl: profileImageUrl || '',
                        userId
                    }
                });
                return newProfile;
            }
            const updatedProfile = await this.prisma.userProfile.update({
                where: { userId },
                data: {
                    firstName: dto.firstName || '',
                    lastName: dto.lastName || '',
                    age: parseInt(dto.age.toString()) || 0,
                    gender: dto.gender || '',
                    phone: dto.phone || '',
                    profileImageUrl: profileImageUrl || '',
                }
            });
            return updatedProfile;
        }
        catch (error) {
            console.log(error);
            throw new common_1.NotFoundException('Profile not found');
        }
    }
    getImageName(name) {
        return name.toLowerCase().replace(/ /g, '_');
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        image_service_1.ImageService])
], ProfileService);
//# sourceMappingURL=profile.service.js.map