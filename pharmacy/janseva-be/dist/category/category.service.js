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
exports.CategoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const image_service_1 = require("../utils/image.service");
let CategoryService = class CategoryService {
    constructor(prisma, imageService) {
        this.prisma = prisma;
        this.imageService = imageService;
    }
    async createCategory(dto, file) {
        const existingCategory = await this.prisma.category.findUnique({
            where: { name: dto.name },
        });
        if (existingCategory) {
            throw new common_1.ConflictException('A category with this name already exists');
        }
        const logoUrl = await this.imageService.uploadImage('categories', `${this.getImageName(dto.name)}`, file.mimetype.toString(), file.buffer);
        return this.prisma.category.create({
            data: {
                ...dto,
                logoUrl,
                createdBy: 'system',
                updatedBy: 'system',
            },
        });
    }
    async getAllCategories() {
        return this.prisma.category.findMany();
    }
    async getPublicCategories(limit, offset) {
        try {
            const totalCount = await this.prisma.category.count();
            const categories = await this.prisma.category.findMany({
                take: limit,
                skip: offset
            });
            return {
                data: categories,
                totalCount
            };
        }
        catch (error) {
            throw new common_1.NotFoundException(`Error in getting Categories`);
        }
    }
    async getCategoryById(id, currentObjectName) {
        try {
            const category = await this.prisma.category.findUnique({ where: { id } });
            if (!category)
                throw new common_1.NotFoundException(`${currentObjectName} not found`);
            let logoFile = null;
            if (category.logoUrl) {
                try {
                    logoFile = await this.imageService.getImageFileFromUrl('categories', category.logoUrl);
                }
                catch (error) {
                    console.error('Error getting logo file:', error);
                }
            }
            return {
                id: category.id,
                name: category.name,
                description: category.description,
                logo: category.logoUrl ? {
                    url: category.logoUrl,
                    path: this.imageService.getImagePathFromUrl(category.logoUrl),
                    file: logoFile || null
                } : null
            };
        }
        catch (error) {
            throw new common_1.NotFoundException(`Error in getting ${currentObjectName}`);
        }
    }
    async updateCategory(id, dto, file) {
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        let logoUrl = category.logoUrl;
        if (file) {
            const newLogoUrl = await this.imageService.uploadImage('categories', `${this.getImageName(dto.name)}`, file.mimetype.toString(), file.buffer);
            if (category.logoUrl) {
                const oldPath = this.imageService.getImagePathFromUrl(category.logoUrl);
                await this.imageService.deleteImage('categories', oldPath);
            }
            logoUrl = newLogoUrl;
        }
        return this.prisma.category.update({
            where: { id },
            data: {
                ...dto,
                logoUrl,
                updatedBy: 'system',
            },
        });
    }
    async deleteCategory(id) {
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        if (category.logoUrl) {
            const path = this.imageService.getImagePathFromUrl(category.logoUrl);
            await this.imageService.deleteImage('categories', path);
        }
        return this.prisma.category.delete({ where: { id } });
    }
    async deleteMultipleCategories(ids, currentObjectNamePlural) {
        const categories = await this.prisma.category.findMany({
            where: { id: { in: ids } }
        });
        if (categories.length === 0)
            throw new common_1.NotFoundException(`${currentObjectNamePlural} not found`);
        for (const category of categories) {
            if (category.logoUrl) {
                const path = this.imageService.getImagePathFromUrl(category.logoUrl);
                await this.imageService.deleteImage('categories', path);
            }
        }
        const deletedCategories = await this.prisma.category.deleteMany({
            where: { id: { in: ids } }
        });
        return deletedCategories;
    }
    getImageName(name) {
        return name.toLowerCase().replace(/ /g, '_');
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        image_service_1.ImageService])
], CategoryService);
//# sourceMappingURL=category.service.js.map