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
exports.CommonService = void 0;
const common_1 = require("@nestjs/common");
const brand_service_1 = require("../brand/brand.service");
const category_service_1 = require("../category/category.service");
const prisma_service_1 = require("../prisma/prisma.service");
const product_service_1 = require("../product/product.service");
const fs = require("fs");
const path = require("path");
let CommonService = class CommonService {
    constructor(productService, categoryService, brandService, prismaService) {
        this.productService = productService;
        this.categoryService = categoryService;
        this.brandService = brandService;
        this.prismaService = prismaService;
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
    async getSearchBarResults(page, limit, search) {
        try {
            const searchResults = [];
            const searchResult = {
                type: "searchTerm",
                value: search,
                image: "",
            };
            searchResults.push(searchResult);
            const categories = await this.getCategoriesBySearchTerm(search);
            const categoryResults = categories.map((category) => ({
                type: "category",
                value: category.name,
                image: category.logoUrl,
            }));
            searchResults.push(...categoryResults);
            const brands = await this.getBrandsBySearchTerm(search);
            const brandResults = brands.map((brand) => ({
                type: "brand",
                value: brand.name,
                image: brand.logoUrl,
            }));
            searchResults.push(...brandResults);
            const products = await this.getProductsBySearchTerm(search);
            const placeholderBase64 = await this.getPlaceholderImageBase64();
            const productResults = products.map((product) => ({
                type: "product",
                value: product.name,
                image: product.images?.[0] || placeholderBase64,
                slug: product.slug,
            }));
            searchResults.push(...productResults);
            return searchResults;
        }
        catch (error) {
            throw new Error("Error in getting search bar results");
        }
    }
    async getProductsBySearchTerm(search) {
        const products = await this.prismaService.product.findMany({
            where: {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            select: {
                name: true,
                images: true,
                slug: true,
            },
        });
        return products;
    }
    async getCategoriesBySearchTerm(search) {
        const categories = await this.prismaService.category.findMany({
            where: {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            select: {
                name: true,
                logoUrl: true,
            },
        });
        return categories;
    }
    async getBrandsBySearchTerm(search) {
        const brands = await this.prismaService.brand.findMany({
            where: {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            select: {
                name: true,
                logoUrl: true,
            },
        });
        return brands;
    }
    async getSearchPageResults(searchRequest) {
        try {
            const { query = "", brands = [], categories = [], price, sort = "name-asc", page = 1, limit = 10 } = searchRequest;
            const where = {};
            if (query) {
                where.OR = [
                    {
                        name: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                    {
                        description: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                    {
                        brand: {
                            name: {
                                contains: query,
                                mode: "insensitive",
                            },
                        },
                    },
                    {
                        category: {
                            name: {
                                contains: query,
                                mode: "insensitive",
                            },
                        },
                    },
                ];
            }
            if (brands && brands.length > 0) {
                where.brand = {
                    name: {
                        in: brands,
                        mode: "insensitive",
                    },
                };
            }
            if (categories && categories.length > 0) {
                where.category = {
                    name: {
                        in: categories,
                        mode: "insensitive",
                    },
                };
            }
            if (price) {
                where.variants = {
                    some: {
                        price: {
                            gte: price.min,
                            lte: price.max,
                        },
                    },
                };
            }
            const searchResults = await this.prismaService.product.findMany({
                where,
                orderBy: this.isPriceSorting(sort) ? undefined : this.buildOrderBy(sort),
                include: {
                    category: {
                        select: {
                            name: true,
                            id: true,
                        },
                    },
                    brand: {
                        select: {
                            name: true,
                            id: true,
                        },
                    },
                    variants: true,
                },
            });
            let sortedResults = searchResults;
            if (this.isPriceSorting(sort)) {
                sortedResults = this.sortByPrice(searchResults, sort);
            }
            const startIndex = (page - 1) * Number.parseInt(limit.toString());
            const endIndex = startIndex + Number.parseInt(limit.toString());
            const paginatedResults = sortedResults.slice(startIndex, endIndex);
            const total = await this.prismaService.product.count({
                where: where,
            });
            const placeholderBase64 = await this.getPlaceholderImageBase64();
            const processedProducts = paginatedResults.map((product) => {
                if (!product.images || product.images.length === 0) {
                    return {
                        ...product,
                        images: [placeholderBase64],
                        imageUrl: placeholderBase64,
                        isPlaceholder: true,
                    };
                }
                else {
                    return {
                        ...product,
                        imageUrl: product.images[0],
                        isPlaceholder: false,
                    };
                }
            });
            return {
                products: processedProducts,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / Number.parseInt(limit.toString())),
            };
        }
        catch (error) {
            throw new Error(`Failed to get search results: ${error.message}`);
        }
    }
    isPriceSorting(sort) {
        return sort === "price-asc" || sort === "price-desc";
    }
    sortByPrice(products, sort) {
        return products.sort((a, b) => {
            const lowestPriceA = this.getLowestVariantPrice(a.variants);
            const lowestPriceB = this.getLowestVariantPrice(b.variants);
            if (sort === "price-asc") {
                return lowestPriceA - lowestPriceB;
            }
            else {
                return lowestPriceB - lowestPriceA;
            }
        });
    }
    getLowestVariantPrice(variants) {
        if (!variants || variants.length === 0) {
            return Number.MAX_VALUE;
        }
        return variants.reduce((lowest, variant) => {
            const originalPrice = variant.price || 0;
            const discount = variant.discount || 0;
            const discountedPrice = discount > 0
                ? originalPrice * (1 - discount / 100)
                : originalPrice;
            return Math.min(lowest, discountedPrice);
        }, Number.MAX_VALUE);
    }
    buildOrderBy(sort) {
        switch (sort) {
            case "name-asc":
                return { name: "asc" };
            case "name-desc":
                return { name: "desc" };
            case "price-asc":
            case "price-desc":
                return { name: "asc" };
            case "newest":
                return { createdAt: "desc" };
            case "oldest":
                return { createdAt: "asc" };
            default:
                return { name: "asc" };
        }
    }
    async getFilters() {
        try {
            const categories = await this.prismaService.category.findMany({
                select: {
                    name: true,
                    id: true,
                },
            });
            const brands = await this.prismaService.brand.findMany({
                select: {
                    name: true,
                    id: true,
                },
            });
            const products = await this.prismaService.product.findMany({
                include: {
                    variants: true,
                },
            });
            let minPrice = Number.MAX_VALUE;
            let maxPrice = 0;
            products.forEach((product) => {
                if (product.variants && product.variants.length > 0) {
                    product.variants.forEach((variant) => {
                        const originalPrice = variant.price || 0;
                        const discount = variant.discount || 0;
                        const discountedPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;
                        if (discountedPrice < minPrice) {
                            minPrice = discountedPrice;
                        }
                        if (discountedPrice > maxPrice) {
                            maxPrice = discountedPrice;
                        }
                    });
                }
            });
            if (minPrice === Number.MAX_VALUE) {
                minPrice = 0;
            }
            return {
                categories,
                brands,
                price: {
                    min: Math.floor(minPrice),
                    max: Math.ceil(maxPrice),
                },
            };
        }
        catch (error) {
            throw new Error("Error in getting filters");
        }
    }
};
exports.CommonService = CommonService;
exports.CommonService = CommonService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [product_service_1.ProductService,
        category_service_1.CategoryService,
        brand_service_1.BrandService,
        prisma_service_1.PrismaService])
], CommonService);
//# sourceMappingURL=common.service.js.map