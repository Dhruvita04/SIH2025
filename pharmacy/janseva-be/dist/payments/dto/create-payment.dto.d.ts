declare class OrderItemDto {
    productId: string;
    variantId: string;
    quantity: number;
    price: number;
}
export declare class CreatePaymentDto {
    addressId: string;
    couponId?: string;
    prescriptionId?: string;
    subTotal: number;
    discount: number;
    shipping: number;
    orderTotal: number;
    items: OrderItemDto[];
}
export {};
