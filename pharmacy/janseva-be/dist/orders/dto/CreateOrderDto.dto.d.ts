export declare class CreateOrderDto {
    userId: string;
    addressId: string;
    couponId?: string;
    prescriptionId?: string;
    paymentId?: string;
    gatewayOrderId?: string;
    paymentSessionId?: string;
    subTotal: number;
    discount: number;
    shipping: number;
    orderTotal: number;
    items: {
        productId: string;
        variantId: string;
        quantity: number;
        price: number;
    }[];
}
