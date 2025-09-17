import { CouponType } from '@prisma/client';
export declare class CreateCouponDto {
    code: string;
    discountType: CouponType;
    discountValue: number;
    maxUses?: number;
    minPurchaseAmount?: number;
    startDate: Date;
    endDate: Date;
    isActive?: boolean;
    userIds?: number[];
    productIds?: number[];
}
