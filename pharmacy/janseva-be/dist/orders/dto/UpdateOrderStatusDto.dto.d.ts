import { OrderStatus } from "@prisma/client";
export declare class UpdateOrderStatusDto {
    status: OrderStatus;
    trackingURL?: string;
    trackingNumber?: string;
    courierName?: string;
}
