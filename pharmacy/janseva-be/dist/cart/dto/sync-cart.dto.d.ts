export declare class SyncCartDto {
    userId: string;
    prescriptionId?: string;
    data: {
        productId: string;
        quantity: number;
        variantId: string;
    }[];
}
