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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const common_1 = require("@nestjs/common");
const product_service_1 = require("./product.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ProductController = class ProductController {
    constructor(productService) {
        this.productService = productService;
        this.currentObjectName = 'Product';
    }
    async create(data) {
        try {
            const response = await this.productService.createProduct(data, this.currentObjectName);
            return {
                status: 'success',
                message: 'Product created successfully',
                data: response,
            };
        }
        catch (error) {
            console.log(error);
            return {
                status: 'error',
                message: error.message,
                data: null,
            };
        }
    }
    async scrapeProduct(data) {
        if (!data.medicineName) {
            return {
                status: 'error',
                message: 'Medicine name is required',
                data: null
            };
        }
        const result = await this.productService.scrapeDetails(data.medicineName);
        return result;
    }
    async getAll(page, limit, search) {
        try {
            const products = await this.productService.getAllProducts(page, limit, search);
            return {
                status: 'success',
                message: 'Products retrieved successfully',
                data: products
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
            await this.productService.deleteProduct(id);
            return {
                status: 'success',
                message: 'Product deleted successfully',
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
            await this.productService.deleteMultipleProducts(ids, this.currentObjectName);
            return {
                status: 'success',
                message: 'Products deleted successfully',
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
    async update(slug, dto) {
        try {
            const updatedProduct = await this.productService.updateProduct(slug, dto, this.currentObjectName);
            return {
                status: 'success',
                message: 'Product updated successfully',
                data: updatedProduct
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
    async getTags(page, limit, tags) {
        try {
            const tagsProducts = await this.productService.getTagsProducts(page, limit, tags);
            return {
                status: 'success',
                message: 'Products retrieved successfully',
                data: tagsProducts
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
    async getTagsSuggestions(search, limit) {
        try {
            const limitNum = limit ? Number.parseInt(limit, 10) : undefined;
            const suggestions = await this.productService.getTagsSuggestions(search, limitNum);
            return {
                status: "success",
                message: "Tags suggestions retrieved successfully",
                data: suggestions,
            };
        }
        catch (error) {
            return {
                status: "error",
                message: error.message,
                data: null,
            };
        }
    }
    async getBySlug(slug) {
        try {
            const product = await this.productService.getProductBySlug(slug);
            return {
                status: 'success',
                message: 'Product retrieved successfully',
                data: product
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
exports.ProductController = ProductController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('scrape'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "scrapeProduct", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "delete", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "deleteMultiple", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('/tags'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('tags')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getTags", null);
__decorate([
    (0, common_1.Get)("/tags/suggestions"),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getTagsSuggestions", null);
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getBySlug", null);
exports.ProductController = ProductController = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [product_service_1.ProductService])
], ProductController);
//# sourceMappingURL=product.controller.js.map