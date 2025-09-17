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
exports.BrandService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const image_service_1 = require("../utils/image.service");
let BrandService = class BrandService {
    constructor(prisma, imageService) {
        this.prisma = prisma;
        this.imageService = imageService;
    }
    async createBrand(dto, file, currentObjectName) {
        const existingBrand = await this.prisma.brand.findUnique({
            where: { name: dto.name },
        });
        if (existingBrand) {
            throw new common_1.ConflictException(`A ${currentObjectName} with this name already exists`);
        }
        const logoUrl = await this.imageService.uploadImage('brands', `${this.getImageName(dto.name)}`, file.mimetype.toString(), file.buffer);
        return this.prisma.brand.create({
            data: {
                ...dto,
                logoUrl,
                createdBy: 'system',
                updatedBy: 'system',
            },
        });
    }
    async getPublicBrands(limit, offset) {
        try {
            const totalCount = await this.prisma.brand.count();
            const brands = await this.prisma.brand.findMany({
                take: limit,
                skip: offset
            });
            return {
                data: brands,
                totalCount
            };
        }
        catch (error) {
            throw new common_1.NotFoundException(`Error in getting Brands`);
        }
    }
    async getAllBrands() {
        return this.prisma.brand.findMany();
    }
    async getBrandById(id, currentObjectName) {
        try {
            const brand = await this.prisma.brand.findUnique({ where: { id } });
            if (!brand)
                throw new common_1.NotFoundException(`${currentObjectName} not found`);
            let logoFile = null;
            if (brand.logoUrl) {
                try {
                    logoFile = await this.imageService.getImageFileFromUrl('brands', brand.logoUrl);
                }
                catch (error) {
                    console.error('Error getting logo file:', error);
                }
            }
            return {
                id: brand.id,
                name: brand.name,
                description: brand.description,
                logo: brand.logoUrl ? {
                    url: brand.logoUrl,
                    path: this.imageService.getImagePathFromUrl(brand.logoUrl),
                    file: logoFile || null
                } : null
            };
        }
        catch (error) {
            throw new common_1.NotFoundException(`Error in getting ${currentObjectName}`);
        }
    }
    async updateBrand(id, dto, currentObjectName, file) {
        const brand = await this.prisma.brand.findUnique({ where: { id } });
        if (!brand)
            throw new common_1.NotFoundException(`${currentObjectName} not found`);
        let logoUrl = brand.logoUrl;
        if (file) {
            const newLogoUrl = await this.imageService.uploadImage('brands', `${this.getImageName(dto.name)}`, file.mimetype.toString(), file.buffer);
            if (brand.logoUrl) {
                const oldPath = this.imageService.getImagePathFromUrl(brand.logoUrl);
                await this.imageService.deleteImage('brands', oldPath);
            }
            logoUrl = newLogoUrl;
        }
        return this.prisma.brand.update({
            where: { id },
            data: {
                ...dto,
                logoUrl,
                updatedBy: 'system',
            },
        });
    }
    async deleteBrand(id, currentObjectName) {
        const brand = await this.prisma.brand.findUnique({ where: { id } });
        if (!brand)
            throw new common_1.NotFoundException(`${currentObjectName} not found`);
        if (brand.logoUrl) {
            const path = this.imageService.getImagePathFromUrl(brand.logoUrl);
            await this.imageService.deleteImage('brands', path);
        }
        await this.prisma.brand.delete({ where: { id } });
    }
    async deleteMultipleBrands(ids, currentObjectName) {
        const brands = await this.prisma.brand.findMany({
            where: { id: { in: ids } }
        });
        if (brands.length === 0)
            throw new common_1.NotFoundException(`${currentObjectName}s not found`);
        for (const brand of brands) {
            if (brand.logoUrl) {
                const path = this.imageService.getImagePathFromUrl(brand.logoUrl);
                await this.imageService.deleteImage('brands', path);
            }
        }
        const deletedBrands = await this.prisma.brand.deleteMany({
            where: { id: { in: ids } }
        });
        return deletedBrands;
    }
    getImageName(name) {
        return name.toLowerCase().replace(/ /g, '_');
    }
};
exports.BrandService = BrandService;
exports.BrandService = BrandService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        image_service_1.ImageService])
], BrandService);
//# sourceMappingURL=brand.service.js.map