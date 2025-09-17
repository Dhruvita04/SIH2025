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
exports.CouponService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CouponService = class CouponService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async applyCoupon(userId, couponCode, cartTotal) {
        try {
            const coupon = await this.prisma.coupon.findUnique({
                where: { code: couponCode },
            });
            if (!coupon) {
                throw new common_1.NotFoundException("Coupon not found");
            }
            if (!coupon.isActive) {
                throw new common_1.BadRequestException("This coupon is not active");
            }
            const currentDate = new Date();
            if (currentDate < coupon.startDate || currentDate > coupon.endDate) {
                throw new common_1.BadRequestException("This coupon has expired or is not yet valid");
            }
            if (coupon.maxUses && coupon.maxUses > 0 && coupon.uses >= coupon.maxUses) {
                throw new common_1.BadRequestException("This coupon has reached its maximum usage limit");
            }
            if (coupon.minPurchaseAmount && cartTotal < Number(coupon.minPurchaseAmount)) {
                throw new common_1.BadRequestException(`Minimum purchase amount of ₹${coupon.minPurchaseAmount} required for this coupon`);
            }
            if (coupon.userIds.length > 0 && !coupon.userIds.includes(Number(userId))) {
                throw new common_1.BadRequestException("This coupon is not valid for your account");
            }
            return {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: Number(coupon.discountValue),
                minPurchaseAmount: coupon.minPurchaseAmount ? Number(coupon.minPurchaseAmount) : null,
                productIds: coupon.productIds,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException("Error applying coupon");
        }
    }
    async createCoupon(dto) {
        try {
            const existingCoupon = await this.prisma.coupon.findUnique({
                where: { code: dto.code },
            });
            if (existingCoupon) {
                throw new common_1.ConflictException("A coupon with this code already exists");
            }
            if (new Date(dto.startDate) > new Date(dto.endDate)) {
                throw new common_1.BadRequestException("Start date must be before end date");
            }
            const coupon = await this.prisma.coupon.create({
                data: {
                    ...dto,
                    discountValue: dto.discountValue,
                    minPurchaseAmount: dto.minPurchaseAmount,
                    startDate: new Date(dto.startDate),
                    endDate: new Date(dto.endDate),
                },
            });
            return this.formatCouponData(coupon);
        }
        catch (error) {
            if (error instanceof common_1.ConflictException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.NotFoundException("Error creating coupon");
        }
    }
    async getCoupons(limit, offset) {
        try {
            const totalCount = await this.prisma.coupon.count();
            const coupons = await this.prisma.coupon.findMany({
                ...(limit && { take: limit }),
                ...(offset && { skip: offset }),
                orderBy: {
                    createdAt: "desc",
                },
            });
            return {
                data: coupons.map((coupon) => this.formatCouponData(coupon)),
                totalCount,
            };
        }
        catch (error) {
            throw new common_1.NotFoundException("Error in getting coupons");
        }
    }
    async getCouponById(id) {
        try {
            const coupon = await this.prisma.coupon.findUnique({
                where: { id },
            });
            if (!coupon) {
                throw new common_1.NotFoundException("Coupon not found");
            }
            return this.formatCouponData(coupon);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.NotFoundException("Error getting coupon");
        }
    }
    async updateCoupon(id, dto) {
        try {
            const coupon = await this.prisma.coupon.findUnique({
                where: { id },
            });
            if (!coupon) {
                throw new common_1.NotFoundException("Coupon not found");
            }
            if (dto.startDate && dto.endDate) {
                if (new Date(dto.startDate) > new Date(dto.endDate)) {
                    throw new common_1.BadRequestException("Start date must be before end date");
                }
            }
            if (dto.code) {
                const existingCoupon = await this.prisma.coupon.findUnique({
                    where: { code: dto.code },
                });
                if (existingCoupon && existingCoupon.id !== id) {
                    throw new common_1.ConflictException("A coupon with this code already exists");
                }
            }
            const updatedCoupon = await this.prisma.coupon.update({
                where: { id },
                data: {
                    ...dto,
                    ...(dto.startDate && { startDate: new Date(dto.startDate) }),
                    ...(dto.endDate && { endDate: new Date(dto.endDate) }),
                },
            });
            return this.formatCouponData(updatedCoupon);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.NotFoundException("Error updating coupon");
        }
    }
    async deleteCoupon(id) {
        try {
            const coupon = await this.prisma.coupon.findUnique({
                where: { id },
            });
            if (!coupon) {
                throw new common_1.NotFoundException("Coupon not found");
            }
            const deletedCoupon = await this.prisma.coupon.delete({
                where: { id },
            });
            return this.formatCouponData(deletedCoupon);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.NotFoundException("Error deleting coupon");
        }
    }
    async deleteMultipleCoupons(ids) {
        try {
            const coupons = await this.prisma.coupon.findMany({
                where: { id: { in: ids } },
            });
            if (coupons.length === 0) {
                throw new common_1.NotFoundException("Coupons not found");
            }
            const deletedCoupons = await this.prisma.coupon.deleteMany({
                where: { id: { in: ids } },
            });
            return deletedCoupons;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.NotFoundException("Error deleting coupons");
        }
    }
    formatCouponData(coupon) {
        return {
            ...coupon,
            discountValue: Number(coupon.discountValue),
            minPurchaseAmount: coupon.minPurchaseAmount ? Number(coupon.minPurchaseAmount) : null,
            startDate: coupon.startDate.toISOString(),
            endDate: coupon.endDate.toISOString(),
            createdAt: coupon.createdAt.toISOString(),
            updatedAt: coupon.updatedAt.toISOString(),
        };
    }
};
exports.CouponService = CouponService;
exports.CouponService = CouponService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CouponService);
//# sourceMappingURL=coupon.service.js.map