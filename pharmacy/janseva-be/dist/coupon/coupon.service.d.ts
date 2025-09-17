import { PrismaService } from "../prisma/prisma.service";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";
export declare class CouponService {
    private prisma;
    constructor(prisma: PrismaService);
    applyCoupon(userId: string, couponCode: string, cartTotal: number): Promise<{
        code: string;
        discountType: import(".prisma/client").$Enums.CouponType;
        discountValue: number;
        minPurchaseAmount: number;
        productIds: number[];
    }>;
    createCoupon(dto: CreateCouponDto): Promise<any>;
    getCoupons(limit?: number, offset?: number): Promise<{
        data: any[];
        totalCount: number;
    }>;
    getCouponById(id: number): Promise<any>;
    updateCoupon(id: number, dto: UpdateCouponDto): Promise<any>;
    deleteCoupon(id: number): Promise<any>;
    deleteMultipleCoupons(ids: number[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
    private formatCouponData;
}
