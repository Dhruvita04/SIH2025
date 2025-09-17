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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponController = void 0;
const common_1 = require("@nestjs/common");
const coupon_service_1 = require("./coupon.service");
const create_coupon_dto_1 = require("./dto/create-coupon.dto");
const update_coupon_dto_1 = require("./dto/update-coupon.dto");
const apply_coupon_dto_1 = require("./dto/apply-coupon.dto");
let CouponController = class CouponController {
    constructor(couponService) {
        this.couponService = couponService;
    }
    async applyCoupon(applyCouponDto) {
        try {
            const response = await this.couponService.applyCoupon(applyCouponDto.userId, applyCouponDto.couponCode, applyCouponDto.cartTotal);
            return {
                status: "success",
                message: "Coupon applied successfully",
                data: response,
            };
        }
        catch (error) {
            return {
                status: "error",
                message: error.message,
                data: null,
            };
        }
    }
    async create(createCouponDto) {
        try {
            const response = await this.couponService.createCoupon(createCouponDto);
            return {
                status: "success",
                message: "Coupon created successfully",
                data: response,
            };
        }
        catch (error) {
            return {
                status: "error",
                message: error.message,
                data: null,
            };
        }
    }
    async findAll(limit, offset) {
        try {
            const response = await this.couponService.getCoupons(limit, offset);
            return {
                status: "success",
                message: "Coupons retrieved successfully",
                data: response,
            };
        }
        catch (error) {
            return {
                status: "error",
                message: error.message,
                data: null,
            };
        }
    }
    async findOne(id) {
        try {
            const response = await this.couponService.getCouponById(id);
            return {
                status: 'success',
                message: 'Coupon retrieved successfully',
                data: response
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    }
    async update(id, updateCouponDto) {
        try {
            const response = await this.couponService.updateCoupon(id, updateCouponDto);
            return {
                status: "success",
                message: "Coupon updated successfully",
                data: response,
            };
        }
        catch (error) {
            return {
                status: "error",
                message: error.message,
                data: null,
            };
        }
    }
    async remove(id) {
        try {
            const response = await this.couponService.deleteCoupon(id);
            return {
                status: 'success',
                message: 'Coupon deleted successfully',
                data: response
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    }
    async removeMany(ids) {
        try {
            const response = await this.couponService.deleteMultipleCoupons(ids);
            return {
                status: 'success',
                message: 'Coupons deleted successfully',
                data: response
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    }
};
exports.CouponController = CouponController;
__decorate([
    (0, common_1.Post)("apply"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [apply_coupon_dto_1.ApplyCouponDto]),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "applyCoupon", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_coupon_dto_1.CreateCouponDto]),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('limit', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('offset', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(":id"),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_coupon_dto_1.UpdateCouponDto]),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Body)('ids', new common_1.ParseArrayPipe({ items: Number, separator: ',' }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "removeMany", null);
exports.CouponController = CouponController = __decorate([
    (0, common_1.Controller)("coupons"),
    __metadata("design:paramtypes", [coupon_service_1.CouponService])
], CouponController);
//# sourceMappingURL=coupon.controller.js.map