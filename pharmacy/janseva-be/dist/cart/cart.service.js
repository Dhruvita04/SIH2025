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
exports.CartService = void 0;
const prisma_service_1 = require("../prisma/prisma.service");
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
let CartService = class CartService {
    constructor(prisma) {
        this.prisma = prisma;
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
    calculateDiscountedPrice(price, discountType, discountValue) {
        if (!discountType || !discountValue || discountValue <= 0) {
            return price;
        }
        switch (discountType.toLowerCase()) {
            case "percentage":
                return price - (price * discountValue) / 100;
            case "fixed":
                return Math.max(0, price - discountValue);
            default:
                return price;
        }
    }
    async addToCart(data) {
        try {
            if (!data.userId || !data.productId || !data.variantId || !data.quantity) {
                throw new Error("Missing required fields: userId, productId, variantId, or quantity");
            }
            if (data.quantity <= 0) {
                throw new Error("Quantity must be greater than 0");
            }
            const productVariant = await this.prisma.productVariant.findUnique({
                where: {
                    id: data.variantId,
                },
                include: {
                    product: true,
                },
            });
            if (!productVariant) {
                throw new Error("Product variant not found");
            }
            if (productVariant.productId !== data.productId) {
                throw new Error("Product variant does not belong to the specified product");
            }
            const user = await this.prisma.user.findUnique({
                where: {
                    id: data.userId,
                },
            });
            if (!user) {
                throw new Error("User not found");
            }
            let cart = await this.prisma.cart.findUnique({
                where: {
                    userId: data.userId,
                },
            });
            if (!cart) {
                cart = await this.prisma.cart.create({
                    data: {
                        userId: data.userId,
                    },
                });
            }
            if (cart.prescriptionOrderId) {
                cart = await this.prisma.cart.update({
                    where: {
                        id: cart.id,
                    },
                    data: {
                        prescriptionOrderId: null,
                        isPrescriptionCart: false,
                    },
                });
            }
            const existingCartItem = await this.prisma.cartProduct.findUnique({
                where: {
                    cartId_productId_variantId: {
                        cartId: cart.id,
                        productId: data.productId,
                        variantId: data.variantId,
                    },
                },
            });
            if (existingCartItem) {
                const updatedItem = await this.prisma.cartProduct.update({
                    where: {
                        cartId_productId_variantId: {
                            cartId: cart.id,
                            productId: data.productId,
                            variantId: data.variantId,
                        },
                    },
                    data: {
                        quantity: existingCartItem.quantity + data.quantity,
                    },
                });
                return {
                    status: "success",
                    message: "Product quantity updated in cart successfully",
                    data: {
                        cartId: cart.id,
                        productId: data.productId,
                        variantId: data.variantId,
                        quantity: updatedItem.quantity,
                    },
                };
            }
            else {
                const cartProduct = await this.prisma.cartProduct.create({
                    data: {
                        cartId: cart.id,
                        productId: data.productId,
                        variantId: data.variantId,
                        quantity: data.quantity,
                    },
                });
                return {
                    status: "success",
                    message: "Product added to cart successfully",
                    data: {
                        cartId: cart.id,
                        productId: data.productId,
                        variantId: data.variantId,
                        quantity: cartProduct.quantity,
                    },
                };
            }
        }
        catch (error) {
            console.error("Error adding to cart:", error);
            throw new Error(`Failed to add product to cart: ${error.message}`);
        }
    }
    async updateCartItem(data) {
        try {
            if (!data.userId || !data.productId || !data.variantId || data.quantity === undefined) {
                throw new Error("Missing required fields: userId, productId, variantId, or quantity");
            }
            if (data.quantity < 0) {
                throw new Error("Quantity cannot be negative");
            }
            let cart = await this.prisma.cart.findUnique({
                where: {
                    userId: data.userId,
                },
            });
            if (!cart) {
                cart = await this.prisma.cart.create({
                    data: {
                        userId: data.userId,
                    },
                });
            }
            if (cart.prescriptionOrderId) {
                cart = await this.prisma.cart.update({
                    where: {
                        id: cart.id,
                    },
                    data: {
                        prescriptionOrderId: null,
                        isPrescriptionCart: false,
                    },
                });
            }
            if (data.quantity === 0) {
                await this.prisma.cartProduct.deleteMany({
                    where: {
                        cartId: cart.id,
                        productId: data.productId,
                        variantId: data.variantId,
                    },
                });
                return {
                    status: "success",
                    message: "Cart item removed successfully",
                    data: null,
                };
            }
            const cartProduct = await this.prisma.cartProduct.upsert({
                where: {
                    cartId_productId_variantId: {
                        cartId: cart.id,
                        productId: data.productId,
                        variantId: data.variantId,
                    },
                },
                update: {
                    quantity: data.quantity,
                },
                create: {
                    cartId: cart.id,
                    productId: data.productId,
                    variantId: data.variantId,
                    quantity: data.quantity,
                },
            });
            return {
                status: "success",
                message: "Cart item updated successfully",
                data: {
                    cartId: cart.id,
                    productId: data.productId,
                    variantId: data.variantId,
                    quantity: cartProduct.quantity,
                },
            };
        }
        catch (error) {
            console.error("Error updating cart item:", error);
            throw new Error(`Failed to update cart item: ${error.message}`);
        }
    }
    async syncCart(data) {
        try {
            if (!data.userId || !Array.isArray(data.data)) {
                throw new Error("Missing required fields: userId or data array");
            }
            let cart = await this.prisma.cart.findUnique({
                where: {
                    userId: data.userId,
                },
                include: {
                    products: {
                        include: {
                            product: {
                                include: {
                                    brand: true,
                                },
                            },
                            variant: true,
                        },
                    },
                },
            });
            if (!cart) {
                cart = await this.prisma.cart.create({
                    data: {
                        userId: data.userId,
                        prescriptionId: data.prescriptionId || null,
                    },
                    include: {
                        products: {
                            include: {
                                product: {
                                    include: {
                                        brand: true,
                                    },
                                },
                                variant: true,
                            },
                        },
                    },
                });
            }
            const placeholderBase64 = await this.getPlaceholderImageBase64();
            if (cart.prescriptionOrderId) {
                const detailedProducts = cart.products.map((cartProduct) => {
                    const originalPrice = cartProduct.variant.price;
                    const discountedPrice = this.calculateDiscountedPrice(originalPrice, cartProduct.variant.discountType, cartProduct.variant.discount);
                    const hasNoImages = !cartProduct.product.images || cartProduct.product.images.length === 0;
                    const imageUrl = hasNoImages ? placeholderBase64 : cartProduct.product.images[0];
                    return {
                        productId: cartProduct.productId,
                        variantId: cartProduct.variantId,
                        name: cartProduct.product.name,
                        brand: cartProduct.product.brand?.name || null,
                        image: imageUrl,
                        isPlaceholder: hasNoImages,
                        variant: {
                            id: cartProduct.variant.id,
                            name: cartProduct.variant.name,
                            units: cartProduct.variant.units,
                        },
                        pricing: {
                            originalPrice: originalPrice,
                            discountedPrice: discountedPrice,
                        },
                        quantity: cartProduct.quantity,
                    };
                });
                return {
                    status: "success",
                    message: "Cart has prescription order, sync skipped",
                    data: {
                        cartId: cart.id,
                        itemsCount: cart.products.length,
                        hasPrescriptionOrder: true,
                        prescriptionId: cart.prescriptionId,
                        prescriptionOrderId: cart.prescriptionOrderId,
                        products: detailedProducts,
                    },
                };
            }
            if (data.prescriptionId !== undefined && data.prescriptionId !== cart.prescriptionId) {
                cart = await this.prisma.cart.update({
                    where: {
                        id: cart.id,
                    },
                    data: {
                        prescriptionId: data.prescriptionId,
                    },
                    include: {
                        products: {
                            include: {
                                product: {
                                    include: {
                                        brand: true,
                                    },
                                },
                                variant: true,
                            },
                        },
                    },
                });
            }
            const payloadItemsMap = new Map();
            for (const item of data.data) {
                if (!item.productId || !item.variantId || item.quantity === undefined || item.quantity < 0) {
                    continue;
                }
                const key = `${item.productId}|${item.variantId}`;
                if (payloadItemsMap.has(key)) {
                    const existingItem = payloadItemsMap.get(key);
                    existingItem.quantity += item.quantity;
                }
                else {
                    payloadItemsMap.set(key, {
                        productId: item.productId,
                        variantId: item.variantId,
                        quantity: item.quantity,
                    });
                }
            }
            const variantIds = Array.from(payloadItemsMap.values()).map((item) => item.variantId);
            const existingVariants = await this.prisma.productVariant.findMany({
                where: {
                    id: { in: variantIds },
                },
                include: {
                    product: {
                        include: {
                            brand: true,
                        },
                    },
                },
            });
            const validVariants = new Map();
            existingVariants.forEach((variant) => {
                validVariants.set(variant.id, variant);
            });
            const validPayloadItems = new Map();
            for (const [key, item] of payloadItemsMap) {
                const variant = validVariants.get(item.variantId);
                if (variant && variant.productId === item.productId) {
                    validPayloadItems.set(key, item);
                }
            }
            const finalItemsMap = new Map();
            for (const [key, payloadItem] of validPayloadItems) {
                if (payloadItem.quantity > 0) {
                    finalItemsMap.set(key, {
                        productId: payloadItem.productId,
                        variantId: payloadItem.variantId,
                        quantity: payloadItem.quantity,
                    });
                }
            }
            await this.prisma.$transaction(async (tx) => {
                await tx.cartProduct.deleteMany({
                    where: {
                        cartId: cart.id,
                    },
                });
                if (finalItemsMap.size > 0) {
                    const cartProductsToCreate = Array.from(finalItemsMap.values()).map((item) => ({
                        cartId: cart.id,
                        productId: item.productId,
                        variantId: item.variantId,
                        quantity: item.quantity,
                    }));
                    await tx.cartProduct.createMany({
                        data: cartProductsToCreate,
                    });
                }
            });
            const updatedCart = await this.prisma.cart.findUnique({
                where: {
                    id: cart.id,
                },
                include: {
                    products: {
                        include: {
                            product: {
                                include: {
                                    brand: true,
                                },
                            },
                            variant: true,
                        },
                    },
                },
            });
            const detailedProducts = updatedCart.products.map((cartProduct) => {
                const originalPrice = cartProduct.variant.price;
                const discountedPrice = this.calculateDiscountedPrice(originalPrice, cartProduct.variant.discountType, cartProduct.variant.discount);
                const hasNoImages = !cartProduct.product.images || cartProduct.product.images.length === 0;
                const imageUrl = hasNoImages ? placeholderBase64 : cartProduct.product.images[0];
                return {
                    productId: cartProduct.productId,
                    variantId: cartProduct.variantId,
                    name: cartProduct.product.name,
                    brand: cartProduct.product.brand?.name || null,
                    image: imageUrl,
                    isPlaceholder: hasNoImages,
                    variant: {
                        id: cartProduct.variant.id,
                        name: cartProduct.variant.name,
                        units: cartProduct.variant.units,
                    },
                    pricing: {
                        originalPrice: originalPrice,
                        discountedPrice: discountedPrice,
                    },
                    quantity: cartProduct.quantity,
                };
            });
            return {
                status: "success",
                message: "Cart synced successfully",
                data: {
                    cartId: updatedCart.id,
                    itemsCount: updatedCart.products.length,
                    prescriptionId: updatedCart.prescriptionId,
                    prescriptionOrderId: updatedCart.prescriptionOrderId,
                    products: detailedProducts,
                },
            };
        }
        catch (error) {
            console.error("Error syncing cart:", error);
            throw new Error(`Failed to sync cart: ${error.message}`);
        }
    }
    async deleteCartItem(data) {
        try {
            if (!data.userId || !data.productId || !data.variantId) {
                throw new Error("Missing required fields: userId, productId, or variantId");
            }
            const cart = await this.prisma.cart.findUnique({
                where: {
                    userId: data.userId,
                },
            });
            if (!cart) {
                throw new Error("Cart not found");
            }
            if (cart.prescriptionOrderId) {
                await this.prisma.cart.update({
                    where: {
                        id: cart.id,
                    },
                    data: {
                        prescriptionOrderId: null,
                        isPrescriptionCart: false,
                    },
                });
            }
            const result = await this.prisma.cartProduct.deleteMany({
                where: {
                    cartId: cart.id,
                    productId: data.productId,
                    variantId: data.variantId,
                },
            });
            return {
                status: "success",
                message: "Cart item deleted successfully",
                data: {
                    deletedCount: result.count,
                },
            };
        }
        catch (error) {
            console.error("Error deleting cart item:", error);
            throw new Error(`Failed to delete cart item: ${error.message}`);
        }
    }
    async changePrescription(userId, prescriptionId) {
        try {
            if (!userId) {
                throw new Error("Missing required field: userId");
            }
            const cart = await this.prisma.cart.findUnique({
                where: {
                    userId: userId,
                },
                include: {
                    products: {
                        include: {
                            product: {
                                include: {
                                    brand: true,
                                },
                            },
                            variant: true,
                        },
                    },
                },
            });
            if (!cart) {
                throw new Error("Cart not found");
            }
            if (prescriptionId) {
                const prescription = await this.prisma.prescription.findUnique({
                    where: {
                        id: prescriptionId,
                    },
                });
                if (!prescription) {
                    throw new Error("Prescription not found");
                }
                if (prescription.userId !== userId) {
                    throw new Error("Prescription does not belong to the user");
                }
            }
            const updatedCart = await this.prisma.cart.update({
                where: {
                    id: cart.id,
                },
                data: {
                    prescriptionId: prescriptionId,
                    prescriptionOrderId: null,
                    isPrescriptionCart: false,
                },
                include: {
                    products: {
                        include: {
                            product: {
                                include: {
                                    brand: true,
                                },
                            },
                            variant: true,
                        },
                    },
                },
            });
            const placeholderBase64 = await this.getPlaceholderImageBase64();
            const detailedProducts = updatedCart.products.map((cartProduct) => {
                const originalPrice = cartProduct.variant.price;
                const discountedPrice = this.calculateDiscountedPrice(originalPrice, cartProduct.variant.discountType, cartProduct.variant.discount);
                const hasNoImages = !cartProduct.product.images || cartProduct.product.images.length === 0;
                const imageUrl = hasNoImages ? placeholderBase64 : cartProduct.product.images[0];
                return {
                    productId: cartProduct.productId,
                    variantId: cartProduct.variantId,
                    name: cartProduct.product.name,
                    brand: cartProduct.product.brand?.name || null,
                    image: imageUrl,
                    isPlaceholder: hasNoImages,
                    variant: {
                        id: cartProduct.variant.id,
                        name: cartProduct.variant.name,
                        units: cartProduct.variant.units,
                    },
                    pricing: {
                        originalPrice: originalPrice,
                        discountedPrice: discountedPrice,
                    },
                    quantity: cartProduct.quantity,
                };
            });
            const successMessage = prescriptionId
                ? "Cart prescription updated successfully"
                : "Prescription removed from cart successfully";
            return {
                status: "success",
                message: successMessage,
                data: {
                    cartId: updatedCart.id,
                    itemsCount: updatedCart.products.length,
                    prescriptionId: updatedCart.prescriptionId,
                    prescriptionOrderId: updatedCart.prescriptionOrderId,
                    isPrescriptionCart: updatedCart.isPrescriptionCart,
                    products: detailedProducts,
                },
            };
        }
        catch (error) {
            console.error("Error changing prescription:", error);
            throw new Error(`Failed to change prescription: ${error.message}`);
        }
    }
    async getCartData(data) {
        try {
            if (!Array.isArray(data)) {
                throw new Error("Missing required field: data array");
            }
            const payloadItemsMap = new Map();
            for (const item of data) {
                if (!item.productId || !item.variantId || item.quantity === undefined || item.quantity < 0) {
                    continue;
                }
                const key = `${item.productId}|${item.variantId}`;
                if (payloadItemsMap.has(key)) {
                    const existingItem = payloadItemsMap.get(key);
                    existingItem.quantity += item.quantity;
                }
                else {
                    payloadItemsMap.set(key, {
                        productId: item.productId,
                        variantId: item.variantId,
                        quantity: item.quantity,
                    });
                }
            }
            const variantIds = Array.from(payloadItemsMap.values()).map((item) => item.variantId);
            if (variantIds.length === 0) {
                return {
                    status: "success",
                    message: "Cart data retrieved successfully",
                    data: {
                        cartId: null,
                        itemsCount: 0,
                        prescriptionId: null,
                        prescriptionOrderId: null,
                        products: [],
                    },
                };
            }
            const existingVariants = await this.prisma.productVariant.findMany({
                where: {
                    id: { in: variantIds },
                },
                include: {
                    product: {
                        include: {
                            brand: true,
                        },
                    },
                },
            });
            const validVariants = new Map();
            existingVariants.forEach((variant) => {
                validVariants.set(variant.id, variant);
            });
            const placeholderBase64 = await this.getPlaceholderImageBase64();
            const validProducts = [];
            for (const [key, item] of payloadItemsMap) {
                const variant = validVariants.get(item.variantId);
                if (variant && variant.productId === item.productId && item.quantity > 0) {
                    const originalPrice = variant.price;
                    const discountedPrice = this.calculateDiscountedPrice(originalPrice, variant.discountType, variant.discount);
                    const hasNoImages = !variant.product.images || variant.product.images.length === 0;
                    const imageUrl = hasNoImages ? placeholderBase64 : variant.product.images[0];
                    validProducts.push({
                        productId: item.productId,
                        variantId: item.variantId,
                        name: variant.product.name,
                        brand: variant.product.brand?.name || null,
                        image: imageUrl,
                        isPlaceholder: hasNoImages,
                        variant: {
                            id: variant.id,
                            name: variant.name,
                            units: variant.units,
                        },
                        pricing: {
                            originalPrice: originalPrice,
                            discountedPrice: discountedPrice,
                        },
                        quantity: item.quantity,
                    });
                }
            }
            return {
                status: "success",
                message: "Cart data retrieved successfully",
                data: {
                    cartId: null,
                    itemsCount: validProducts.length,
                    prescriptionId: null,
                    prescriptionOrderId: null,
                    products: validProducts,
                },
            };
        }
        catch (error) {
            console.error("Error getting cart data:", error);
            throw new Error(`Failed to get cart data: ${error.message}`);
        }
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CartService);
//# sourceMappingURL=cart.service.js.map