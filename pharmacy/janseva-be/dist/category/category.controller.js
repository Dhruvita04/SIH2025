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
exports.CategoryController = void 0;
const common_1 = require("@nestjs/common");
const category_service_1 = require("./category.service");
const create_category_dto_1 = require("./dto/create-category.dto");
const update_category_dto_1 = require("./dto/update-category.dto");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let CategoryController = class CategoryController {
    constructor(categoryService) {
        this.categoryService = categoryService;
        this.currentObjectName = 'Category';
        this.currentObjectNamePlural = 'Categories';
    }
    async create(dto, file) {
        try {
            if (!file) {
                throw new Error('No file uploaded');
            }
            const response = await this.categoryService.createCategory(dto, file);
            return {
                status: 'success',
                message: `${this.currentObjectName} created successfully`,
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
    async getPublicCategories(limit, offset) {
        try {
            const categories = await this.categoryService.getPublicCategories(limit, offset);
            return {
                status: 'success',
                message: 'Categories retrieved successfully',
                data: categories
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
            const categories = await this.categoryService.getAllCategories();
            return {
                status: 'success',
                message: `${this.currentObjectNamePlural} retrieved successfully`,
                data: categories
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
            const category = await this.categoryService.getCategoryById(id, this.currentObjectName);
            return {
                status: 'success',
                message: `${this.currentObjectName} retrieved successfully`,
                data: category
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
            const updatedCategory = await this.categoryService.updateCategory(id, dto, file);
            return {
                status: 'success',
                message: `${this.currentObjectName} updated successfully`,
                data: updatedCategory
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
            await this.categoryService.deleteCategory(id);
            return {
                status: 'success',
                message: `${this.currentObjectName} deleted successfully`,
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
            await this.categoryService.deleteMultipleCategories(ids, this.currentObjectNamePlural);
            return {
                status: 'success',
                message: `${this.currentObjectNamePlural} deleted successfully`,
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
exports.CategoryController = CategoryController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('logo')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_category_dto_1.CreateCategoryDto, typeof (_a = typeof multer_1.Multer !== "undefined" && multer_1.Multer.File) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('public'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "getPublicCategories", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "getAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "getById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('logo')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Optional)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_category_dto_1.UpdateCategoryDto, typeof (_b = typeof multer_1.Multer !== "undefined" && multer_1.Multer.File) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "delete", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "deleteMultiple", null);
exports.CategoryController = CategoryController = __decorate([
    (0, common_1.Controller)('categories'),
    __metadata("design:paramtypes", [category_service_1.CategoryService])
], CategoryController);
//# sourceMappingURL=category.controller.js.map