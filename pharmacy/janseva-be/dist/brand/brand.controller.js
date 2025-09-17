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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandController = void 0;
const common_1 = require("@nestjs/common");
const brand_service_1 = require("./brand.service");
const create_brand_dto_1 = require("./dto/create-brand.dto");
const update_brand_dto_1 = require("./dto/update-brand.dto");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let BrandController = class BrandController {
    constructor(brandService) {
        this.brandService = brandService;
        this.currentObjectName = 'Company';
    }
    async create(dto, file) {
        try {
            if (!file) {
                throw new Error('No file uploaded');
            }
            const response = await this.brandService.createBrand(dto, file, this.currentObjectName);
            return {
                status: 'success',
                message: 'Brand created successfully',
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
    async getPublicBrands(limit, offset) {
        try {
            const brands = await this.brandService.getPublicBrands(limit, offset);
            return {
                status: 'success',
                message: 'Brands retrieved successfully',
                data: brands
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
    async getAll() {
        try {
            const brands = await this.brandService.getAllBrands();
            return {
                status: 'success',
                message: 'Brands retrieved successfully',
                data: brands
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
    async getById(id) {
        try {
            const brand = await this.brandService.getBrandById(id, this.currentObjectName);
            return {
                status: 'success',
                message: 'Brand retrieved successfully',
                data: brand
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
    async update(id, dto, file) {
        try {
            const updatedBrand = await this.brandService.updateBrand(id, dto, this.currentObjectName, file);
            return {
                status: 'success',
                message: 'Brand updated successfully',
                data: updatedBrand
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
    async delete(id) {
        try {
            await this.brandService.deleteBrand(id, this.currentObjectName);
            return {
                status: 'success',
                message: 'Brand deleted successfully',
                data: null
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
    async deleteMultiple(ids) {
        try {
            await this.brandService.deleteMultipleBrands(ids, this.currentObjectName);
            return {
                status: 'success',
                message: 'Brands deleted successfully',
                data: null
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
exports.BrandController = BrandController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('logo')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_brand_dto_1.CreateBrandDto, typeof (_a = typeof multer_1.Multer !== "undefined" && multer_1.Multer.File) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], BrandController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('public'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], BrandController.prototype, "getPublicBrands", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BrandController.prototype, "getAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandController.prototype, "getById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('logo')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Optional)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_brand_dto_1.UpdateBrandDto, typeof (_b = typeof multer_1.Multer !== "undefined" && multer_1.Multer.File) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], BrandController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandController.prototype, "delete", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], BrandController.prototype, "deleteMultiple", null);
exports.BrandController = BrandController = __decorate([
    (0, common_1.Controller)('brands'),
    __metadata("design:paramtypes", [brand_service_1.BrandService])
], BrandController);
//# sourceMappingURL=brand.controller.js.map