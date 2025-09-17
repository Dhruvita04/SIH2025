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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const common_1 = require("@nestjs/common");
const profile_service_1 = require("./profile.service");
const profile_dto_1 = require("./dto/profile.dto");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ProfileController = class ProfileController {
    constructor(profileService) {
        this.profileService = profileService;
    }
    async create(userId, dto, file) {
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
        }
        catch (error) {
            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    }
    async getById(userId) {
        try {
            const profile = await this.profileService.getProfile(userId);
            return {
                status: 'success',
                message: 'Profile retrieved successfully',
                data: profile
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    }
};
exports.ProfileController = ProfileController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':userId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('profileImage')),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, profile_dto_1.ProfileDto, typeof (_a = typeof multer_1.Multer !== "undefined" && multer_1.Multer.File) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "getById", null);
exports.ProfileController = ProfileController = __decorate([
    (0, common_1.Controller)('profile'),
    __metadata("design:paramtypes", [profile_service_1.ProfileService])
], ProfileController);
//# sourceMappingURL=profile.controller.js.map