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
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const image_service_1 = require("../utils/image.service");
const scraper_1 = require("../utils/scraper");
const fs = require("fs");
const path = require("path");
let ProductService = class ProductService {
    constructor(prisma, imageService) {
        this.prisma = prisma;
        this.imageService = imageService;
    }
    async getPlaceholderImageBase64() {
        try {
            const placeholderPath = path.join(process.cwd(), "public", "placeholder.png");
            const imageBuffer = fs.readFileSync(placeholderPath);
            const base64String = imageBuffer.toString("base64");
            return `data:image/png;base64,${base64String}`;
        }
        catch (error) {
            return "/placeholder.png";
        }
    }
    base64ToBuffer(base64String) {
        const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
        try {
            return Buffer.from(base64Data, "base64");
        }
        catch (error) {
            throw new Error("Invalid base64 string");
        }
    }
    async createProduct(data, currentObjectName) {
        try {
            const existingProductByName = await this.prisma.product.findFirst({
                where: { name: data.productName },
            });
            if (existingProductByName) {
                throw new common_1.ConflictException(`A ${currentObjectName} with this name already exists`);
            }
            const existingProductBySlug = await this.prisma.product.findFirst({
                where: { slug: data.productSlug },
            });
            if (existingProductBySlug) {
                throw new common_1.ConflictException(`A ${currentObjectName} with this slug already exists`);
            }
            const imageUrls = [];
            if (data.productImages && data.productImages.length > 0) {
                try {
                    for (let i = 0; i < data.productImages.length; i++) {
                        if (!this.isValidBase64(data.productImages[i])) {
                            throw new Error("Invalid base64 string");
                        }
                        const buffer = this.base64ToBuffer(data.productImages[i]);
                        const imageUrl = await this.imageService.uploadImage("products", `${this.formatProductName(data.productName)}_${i + 1}.${this.getExtensionFromBase64(data.productImages[i])}`, this.getMimeTypeFromBase64(data.productImages[i]), buffer);
                        imageUrls.push(imageUrl);
                    }
                }
                catch (error) {
                    throw new Error(`Error uploading product images: ${error.message}`);
                }
            }
            const product = await this.prisma.product.create({
                data: {
                    name: data.productName,
                    slug: data.productSlug,
                    description: data.productDescription,
                    images: imageUrls,
                    categoryId: data.categoryId,
                    brandId: data.brandId,
                    uses: data.uses,
                    direction: data.productDirections,
                    routeOfAdministration: data.productRouteOfAdministration,
                    sideEffects: data.productSideEffects,
                    medActivity: data.productMedActivity,
                    precaution: data.productPrecaution,
                    interactions: data.productInteractions,
                    dosageInformation: data.productDosageInformation,
                    storage: data.productStorage,
                    dietAndLifestyleGuidance: data.productDietAndLifestyleGuidance,
                    highlights: data.productHighlights,
                    ingredients: data.productIngredients,
                    keyUses: data.productKeyUses,
                    howToUse: data.productHowToUse,
                    safetyInformation: data.productSafetyInformation,
                    additionalInfo: data.productAdditionalInfo,
                    composition: data.productComposition,
                    hsnCode: data.productHsnCode,
                    tags: data.tags || [],
                    createdBy: "system",
                    updatedBy: "system",
                },
            });
            const productId = product.id;
            try {
                await this.createProductVariants(data, productId);
            }
            catch (error) {
                await this.prisma.product.delete({ where: { id: productId } });
                throw new Error(`Error creating product variants: ${error.message}`);
            }
            if (data.hasAlternativeProduct) {
                try {
                    const alternativeBuffer = this.base64ToBuffer(data.productAlternativeImage);
                    const productAlternativeImageUrl = await this.imageService.uploadImage("products", `${this.formatProductName(data.productAlternatives.productAlternativeName)}.${this.getExtensionFromBase64(data.productAlternativeImage)}`, this.getMimeTypeFromBase64(data.productAlternativeImage), alternativeBuffer);
                    await this.createProductAlternative(data, productAlternativeImageUrl, productId);
                }
                catch (error) {
                    await this.prisma.product.delete({ where: { id: productId } });
                    throw new Error(`Error creating product alternative: ${error.message}`);
                }
            }
            return product;
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new Error(`Failed to create product: ${error.message}`);
        }
    }
    isValidBase64(str) {
        if (str.startsWith("data:")) {
            const matches = str.match(/^data:image\/(\w+);base64,(.+)$/);
            if (!matches)
                return false;
            str = matches[2];
        }
        try {
            return btoa(atob(str)) === str;
        }
        catch (err) {
            return false;
        }
    }
    formatProductName(name) {
        return name.toLowerCase().replace(/ /g, "_");
    }
    getMimeTypeFromBase64(base64) {
        return base64 == "" || base64 == " " ? " " : base64.split(";")[0].split(":")[1];
    }
    getExtensionFromBase64(base64) {
        return base64 == "" || base64 == " " ? " " : base64.split(";")[0].split("/")[1];
    }
    async createProductAlternative(data, productAlternativeImageUrl, productId) {
        const productAlternativeData = {
            productId: productId,
            productName: data.productAlternatives.productAlternativeName,
            companyName: data.productAlternatives.productAlternativeCompanyName,
            productContent: data.productAlternatives.productAlternativeContent,
            price: data.productAlternatives.productAlternativePrice,
            discount: data.productAlternatives.productAlternativeDiscount,
            discountType: data.productAlternatives.productAlternativeDiscountType,
            units: data.productAlternatives.productAlternativeUnits,
            imageUrl: productAlternativeImageUrl,
        };
        return this.prisma.productAlternative.create({
            data: productAlternativeData,
        });
    }
    async createProductVariants(dto, productId) {
        for (let index = 0; index < dto.productVariations.length; index++) {
            const variant = dto.productVariations[index];
            const productVariantData = {
                product: { connect: { id: productId } },
                name: variant.name,
                price: variant.price,
                discount: variant.discount,
                discountType: variant.discountType,
                units: variant.units,
                stock: variant.stock,
                createdBy: "system",
                updatedBy: "system",
            };
            await this.prisma.productVariant.create({
                data: productVariantData,
            });
        }
    }
    async getAllProducts(page, limit, search) {
        try {
            const defaultPage = page || 1;
            const defaultLimit = limit || 10;
            if (defaultPage < 1 || defaultLimit < 1) {
                throw new Error("Page and limit must be greater than 0");
            }
            const parsedLimit = Number(defaultLimit);
            if (isNaN(parsedLimit)) {
                throw new Error("Limit must be a valid number");
            }
            const where = search
                ? {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { slug: { contains: search, mode: "insensitive" } },
                        {
                            brand: {
                                name: { contains: search, mode: "insensitive" },
                            },
                        },
                        {
                            category: {
                                name: { contains: search, mode: "insensitive" },
                            },
                        },
                    ],
                }
                : {};
            const productCount = await this.prisma.product.count({ where: where });
            const products = await this.prisma.product.findMany({
                where: where,
                skip: (defaultPage - 1) * parsedLimit,
                take: parsedLimit,
                orderBy: {
                    createdAt: "desc",
                },
            });
            if (products.length === 0)
                throw new common_1.NotFoundException("No products found");
            const placeholderBase64 = await this.getPlaceholderImageBase64();
            const updatedData = await Promise.all(products.map(async (product) => {
                const brand = await this.getBrandName(product.brandId);
                const category = await this.getCategoryName(product.categoryId);
                const variationsCount = await this.getProductVariationsCount(product.id);
                const variations = await this.getProductVariations(product.id);
                const alternative = await this.getProductAlternative(product.id);
                const hasNoImages = !product.images || product.images.length === 0;
                const imageUrl = hasNoImages ? placeholderBase64 : product.images[0];
                const isPlaceholder = hasNoImages;
                return {
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    imageUrl,
                    isPlaceholder,
                    brand,
                    category,
                    productVariationsList: variations,
                    productVariations: variationsCount,
                    hasAlternative: alternative !== null ? "Yes" : "No",
                    createdBy: product.createdBy,
                    updatedBy: product.updatedBy,
                };
            }));
            return {
                data: updatedData,
                total: productCount,
            };
        }
        catch (error) {
            throw new Error(`Error in getting all products: ${error.message}`);
        }
    }
    async getBrandName(brandId) {
        const brand = await this.prisma.brand.findUnique({ where: { id: brandId } });
        if (!brand)
            throw new Error("Brand not found");
        return brand.name;
    }
    async getCategoryName(categoryId) {
        const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
        if (!category)
            throw new Error("Category not found");
        return category.name;
    }
    async getProductVariationsCount(productId) {
        const variations = await this.prisma.productVariant.count({ where: { productId } });
        return variations;
    }
    async getProductAlternative(productId) {
        const alternative = await this.prisma.productAlternative.findFirst({ where: { productId } });
        return alternative;
    }
    async getProductVariations(productId) {
        const variations = await this.prisma.productVariant.findMany({
            where: {
                productId,
                name: { not: { startsWith: "[ARCHIVED]" } },
            },
        });
        return variations;
    }
    async deleteProduct(id) {
        const variants = await this.prisma.productVariant.findMany({
            where: { productId: id },
            select: { id: true },
        });
        const variantIds = variants.map((v) => v.id);
        const orderProducts = await this.prisma.orderProduct.findMany({
            where: { variantId: { in: variantIds } },
            select: { id: true },
        });
        const orderProductIds = orderProducts.map((o) => o.id);
        if (orderProductIds.length > 0) {
            await this.prisma.shippedBatch.deleteMany({
                where: { orderProductId: { in: orderProductIds } },
            });
        }
        if (variantIds.length > 0) {
            await this.prisma.cartProduct.deleteMany({
                where: { variantId: { in: variantIds } },
            });
            await this.prisma.orderProduct.deleteMany({
                where: { variantId: { in: variantIds } },
            });
        }
        const alternativeImage = await this.prisma.productAlternative.findFirst({
            where: { productId: id },
            select: { imageUrl: true },
        });
        if (alternativeImage) {
            await this.imageService.deleteImage("products", alternativeImage.imageUrl);
        }
        await this.prisma.productAlternative.deleteMany({ where: { productId: id } });
        const product = await this.prisma.product.findFirst({
            where: { id },
            select: { images: true },
        });
        if (product?.images?.length) {
            for (const image of product.images) {
                await this.imageService.deleteImage("products", image);
            }
        }
        await this.prisma.productVariant.deleteMany({
            where: { productId: id },
        });
        const deleted = await this.prisma.product.delete({
            where: { id },
        });
        return deleted;
    }
    async getProductBySlug(slug) {
        try {
            const product = await this.prisma.product.findUnique({
                where: { slug },
                include: {
                    brand: true,
                    category: true,
                },
            });
            if (!product)
                throw new common_1.NotFoundException(`Product not found`);
            const alternative = await this.getProductAlternative(product.id);
            const variations = await this.getProductVariations(product.id);
            const sortedVariations = variations.sort((a, b) => a.price - b.price);
            let productImages = product.images && product.images.length > 0 ? product.images : [];
            let isPlaceholder = false;
            if (productImages.length === 0) {
                const placeholderBase64 = await this.getPlaceholderImageBase64();
                productImages = [placeholderBase64];
                isPlaceholder = true;
            }
            return {
                productDetails: {
                    ...product,
                    images: productImages,
                    isPlaceholder,
                    brand: product.brand.name,
                    category: product.category.name,
                },
                alternativeDetails: alternative,
                variationsDetails: sortedVariations,
            };
        }
        catch (error) {
            throw new common_1.NotFoundException(`Error in getting product details`);
        }
    }
    async updateProduct(slug, data, currentObjectName) {
        const product = await this.prisma.product.findUnique({ where: { slug } });
        if (!product)
            throw new common_1.NotFoundException(`Product not found`);
        const existingProductByName = await this.prisma.product.findFirst({
            where: {
                name: data.productName,
                id: { not: product.id },
            },
        });
        if (existingProductByName) {
            throw new common_1.ConflictException(`A ${currentObjectName} with this name already exists`);
        }
        const existingProductBySlug = await this.prisma.product.findFirst({
            where: {
                slug: data.productSlug,
                id: { not: product.id },
            },
        });
        if (existingProductBySlug) {
            throw new common_1.ConflictException(`A ${currentObjectName} with this slug already exists`);
        }
        const alternative = await this.getProductAlternative(product.id);
        if (alternative) {
            await this.imageService.deleteImage("products", alternative.imageUrl);
            const alternativeBuffer = this.base64ToBuffer(data.productAlternativeImage);
            const productAlternativeImageUrl = await this.imageService.uploadImage("products", `${this.formatProductName(data.productAlternatives.productAlternativeName)}.${this.getExtensionFromBase64(data.productAlternativeImage)}`, this.getMimeTypeFromBase64(data.productAlternativeImage), alternativeBuffer);
            await this.prisma.productAlternative.update({
                where: { productId: product.id },
                data: {
                    imageUrl: productAlternativeImageUrl,
                    productName: data.productAlternatives.productAlternativeName,
                    companyName: data.productAlternatives.productAlternativeCompanyName,
                    productContent: data.productAlternatives.productAlternativeContent,
                    price: data.productAlternatives.productAlternativePrice,
                    discount: data.productAlternatives.productAlternativeDiscount,
                    discountType: data.productAlternatives.productAlternativeDiscountType,
                    units: data.productAlternatives.productAlternativeUnits,
                },
            });
        }
        const existingVariants = await this.prisma.productVariant.findMany({
            where: { productId: product.id },
        });
        await this.prisma.$transaction(async (tx) => {
            const variantIds = existingVariants.map((variant) => variant.id);
            if (variantIds.length > 0) {
                await tx.cartProduct.deleteMany({
                    where: { variantId: { in: variantIds } },
                });
            }
            const existingVariantsById = new Map(existingVariants.map((v) => [v.id, v]));
            const incomingVariantIds = new Set(data.productVariations
                .filter((v) => v.id)
                .map((v) => v.id));
            for (const variation of data.productVariations) {
                if (variation.id && existingVariantsById.has(variation.id)) {
                    await tx.productVariant.update({
                        where: { id: variation.id },
                        data: {
                            name: variation.name,
                            price: variation.price,
                            discount: variation.discount,
                            discountType: variation.discountType,
                            stock: variation.stock,
                            units: variation.units,
                            updatedBy: "system",
                        },
                    });
                }
                else {
                    await tx.productVariant.create({
                        data: {
                            productId: product.id,
                            name: variation.name,
                            price: variation.price,
                            discount: variation.discount,
                            discountType: variation.discountType,
                            stock: variation.stock,
                            units: variation.units,
                            createdBy: "system",
                            updatedBy: "system",
                        },
                    });
                }
            }
            const variantsToDelete = existingVariants.filter((variant) => !incomingVariantIds.has(variant.id));
            for (const variant of variantsToDelete) {
                await tx.orderProduct.deleteMany({
                    where: { variantId: variant.id },
                });
                await tx.productVariant.delete({
                    where: { id: variant.id },
                });
            }
        });
        let newImageUrls = [];
        if (data.productImages !== undefined) {
            if (data.productImages.length > 0) {
                for (const imageUrl of product.images) {
                    await this.imageService.deleteImage("products", imageUrl);
                }
                for (let i = 0; i < data.productImages.length; i++) {
                    const buffer = this.base64ToBuffer(data.productImages[i]);
                    const imageUrl = await this.imageService.uploadImage("products", `${this.formatProductName(data.productName)}_${i + 1}.${this.getExtensionFromBase64(data.productImages[i])}`, this.getMimeTypeFromBase64(data.productImages[i]), buffer);
                    newImageUrls.push(imageUrl);
                }
            }
            else {
                for (const imageUrl of product.images) {
                    await this.imageService.deleteImage("products", imageUrl);
                }
                newImageUrls = [];
            }
        }
        else {
            for (const imageUrl of product.images) {
                await this.imageService.deleteImage("products", imageUrl);
            }
            newImageUrls = [];
        }
        const updatedProduct = await this.prisma.product.update({
            where: { id: product.id },
            data: {
                name: data.productName,
                slug: data.productSlug,
                description: data.productDescription,
                images: newImageUrls,
                categoryId: data.categoryId,
                brandId: data.brandId,
                uses: data.uses,
                direction: data.productDirections,
                routeOfAdministration: data.productRouteOfAdministration,
                sideEffects: data.productSideEffects,
                medActivity: data.productMedActivity,
                precaution: data.productPrecaution,
                interactions: data.productInteractions,
                dosageInformation: data.productDosageInformation,
                storage: data.productStorage,
                dietAndLifestyleGuidance: data.productDietAndLifestyleGuidance,
                highlights: data.productHighlights,
                ingredients: data.productIngredients,
                keyUses: data.productKeyUses,
                howToUse: data.productHowToUse,
                safetyInformation: data.productSafetyInformation,
                additionalInfo: data.productAdditionalInfo,
                composition: data.productComposition,
                hsnCode: data.productHsnCode,
                tags: data.tags || [],
                updatedBy: "system",
            },
        });
        return updatedProduct;
    }
    async deleteMultipleProducts(ids, currentObjectName) {
        const products = await this.prisma.product.findMany({
            where: { id: { in: ids } },
        });
        if (products.length === 0)
            throw new common_1.NotFoundException(`${currentObjectName}s not found`);
        for (const product of products) {
            await this.deleteProduct(product.id);
        }
        return { message: "Products deleted successfully" };
    }
    getImageName(name) {
        return name.toLowerCase().replace(/ /g, "_");
    }
    async scrapeDetails(medicineName) {
        const result = await (0, scraper_1.scrape)(medicineName);
        return result;
    }
    async getTagsProducts(page, limit, tags) {
        try {
            const defaultPage = page || 1;
            const defaultLimit = limit || 10;
            if (defaultPage < 1 || defaultLimit < 1) {
                throw new Error("Page and limit must be greater than 0");
            }
            const parsedLimit = Number(defaultLimit);
            if (isNaN(parsedLimit)) {
                throw new Error("Limit must be a valid number");
            }
            const productCount = await this.prisma.product.count({ where: { tags: { has: tags } } });
            const products = await this.prisma.product.findMany({
                where: { tags: { has: tags } },
                skip: (defaultPage - 1) * parsedLimit,
                take: parsedLimit,
                orderBy: {
                    createdAt: "desc",
                },
            });
            if (products.length === 0)
                throw new common_1.NotFoundException("No products found");
            const placeholderBase64 = await this.getPlaceholderImageBase64();
            const updatedData = await Promise.all(products.map(async (product) => {
                const brand = await this.getBrandName(product.brandId);
                const category = await this.getCategoryName(product.categoryId);
                const variationsCount = await this.getProductVariationsCount(product.id);
                const variations = await this.getProductVariations(product.id);
                const alternative = await this.getProductAlternative(product.id);
                const hasNoImages = !product.images || product.images.length === 0;
                const imageUrl = hasNoImages ? placeholderBase64 : product.images[0];
                const isPlaceholder = hasNoImages;
                return {
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    imageUrl,
                    isPlaceholder,
                    brand,
                    category,
                    productVariationsList: variations,
                    productVariations: variationsCount,
                    hasAlternative: alternative !== null ? "Yes" : "No",
                    createdBy: product.createdBy,
                    updatedBy: product.updatedBy,
                };
            }));
            return {
                data: updatedData,
                total: productCount,
            };
        }
        catch (error) {
            throw new Error(`Error in getting tags products: ${error.message}`);
        }
    }
    async getTagsSuggestions(search, limit) {
        try {
            const products = await this.prisma.product.findMany({
                select: {
                    tags: true,
                },
                where: {
                    tags: {
                        isEmpty: false,
                    },
                },
            });
            const allTags = new Set();
            products.forEach((product) => {
                product.tags.forEach((tag) => {
                    allTags.add(tag);
                });
            });
            let uniqueTags = Array.from(allTags);
            if (search) {
                uniqueTags = uniqueTags.filter((tag) => tag.toLowerCase().includes(search.toLowerCase()));
            }
            uniqueTags.sort();
            if (limit && limit > 0) {
                uniqueTags = uniqueTags.slice(0, limit);
            }
            return uniqueTags;
        }
        catch (error) {
            throw new Error(`Error in getting tags suggestions: ${error.message}`);
        }
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        image_service_1.ImageService])
], ProductService);
//# sourceMappingURL=product.service.js.map