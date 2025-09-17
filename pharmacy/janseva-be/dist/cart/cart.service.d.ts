import { PrismaService } from "src/prisma/prisma.service";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { SyncCartDto } from "./dto/sync-cart.dto";
import { DeleteCartItemDto } from "./dto/delete-cart-item.dto";
import { UpdateCartItemDto } from "./dto/update-cart.dto";
export declare class CartService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private getPlaceholderImageBase64;
    private calculateDiscountedPrice;
    addToCart(data: AddToCartDto): Promise<{
        status: string;
        message: string;
        data: {
            cartId: string;
            productId: string;
            variantId: string;
            quantity: number;
        };
    }>;
    updateCartItem(data: UpdateCartItemDto): Promise<{
        status: string;
        message: string;
        data: {
            cartId: string;
            productId: string;
            variantId: string;
            quantity: number;
        };
    }>;
    syncCart(data: SyncCartDto): Promise<{
        status: string;
        message: string;
        data: {
            cartId: string;
            itemsCount: number;
            hasPrescriptionOrder: boolean;
            prescriptionId: string;
            prescriptionOrderId: string;
            products: {
                productId: string;
                variantId: string;
                name: string;
                brand: string;
                image: string;
                isPlaceholder: boolean;
                variant: {
                    id: string;
                    name: string;
                    units: number;
                };
                pricing: {
                    originalPrice: number;
                    discountedPrice: number;
                };
                quantity: number;
            }[];
        };
    } | {
        status: string;
        message: string;
        data: {
            cartId: string;
            itemsCount: number;
            prescriptionId: string;
            prescriptionOrderId: string;
            products: {
                productId: string;
                variantId: string;
                name: string;
                brand: string;
                image: string;
                isPlaceholder: boolean;
                variant: {
                    id: string;
                    name: string;
                    units: number;
                };
                pricing: {
                    originalPrice: number;
                    discountedPrice: number;
                };
                quantity: number;
            }[];
            hasPrescriptionOrder?: undefined;
        };
    }>;
    deleteCartItem(data: DeleteCartItemDto): Promise<{
        status: string;
        message: string;
        data: {
            deletedCount: number;
        };
    }>;
    changePrescription(userId: string, prescriptionId: string | null): Promise<{
        status: string;
        message: string;
        data: {
            cartId: string;
            itemsCount: number;
            prescriptionId: string;
            prescriptionOrderId: string;
            isPrescriptionCart: boolean;
            products: {
                productId: string;
                variantId: string;
                name: string;
                brand: string;
                image: string;
                isPlaceholder: boolean;
                variant: {
                    id: string;
                    name: string;
                    units: number;
                };
                pricing: {
                    originalPrice: number;
                    discountedPrice: number;
                };
                quantity: number;
            }[];
        };
    }>;
    getCartData(data: {
        productId: string;
        quantity: number;
        variantId: string;
    }[]): Promise<{
        status: string;
        message: string;
        data: {
            cartId: any;
            itemsCount: number;
            prescriptionId: any;
            prescriptionOrderId: any;
            products: any[];
        };
    }>;
}
