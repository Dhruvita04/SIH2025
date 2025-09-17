import { CouponService } from "./coupon.service";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";
import { ApplyCouponDto } from "./dto/apply-coupon.dto";
export declare class CouponController {
    private readonly couponService;
    constructor(couponService: CouponService);
    applyCoupon(applyCouponDto: ApplyCouponDto): Promise<{
        status: string;
        message: string;
        data: {
            code: string;
            discountType: import(".prisma/client").$Enums.CouponType;
            discountValue: number;
            minPurchaseAmount: number;
            productIds: number[];
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    create(createCouponDto: CreateCouponDto): Promise<{
        status: string;
        message: string;
        data: any;
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    findAll(limit?: number, offset?: number): Promise<{
        status: string;
        message: string;
        data: {
            data: any[];
            totalCount: number;
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    findOne(id: number): Promise<{
        status: string;
        message: string;
        data: any;
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    update(id: number, updateCouponDto: UpdateCouponDto): Promise<{
        status: string;
        message: string;
        data: any;
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    remove(id: number): Promise<{
        status: string;
        message: string;
        data: any;
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    removeMany(ids: number[]): Promise<{
        status: string;
        message: string;
        data: import(".prisma/client").Prisma.BatchPayload;
    } | {
        status: string;
        message: any;
        data: any;
    }>;
}
