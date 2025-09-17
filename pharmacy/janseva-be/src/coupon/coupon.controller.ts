import { Controller, Get, Post, Body, Param, Delete, Query, ParseIntPipe, Put, ParseArrayPipe } from "@nestjs/common"
import { CouponService } from "./coupon.service"
import { CreateCouponDto } from "./dto/create-coupon.dto"
import { UpdateCouponDto } from "./dto/update-coupon.dto"
import { ApplyCouponDto } from "./dto/apply-coupon.dto"

@Controller("coupons")
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post("apply")
  async applyCoupon(@Body() applyCouponDto: ApplyCouponDto) {
    try {
      const response = await this.couponService.applyCoupon(
        applyCouponDto.userId,
        applyCouponDto.couponCode,
        applyCouponDto.cartTotal,
      )
      return {
        status: "success",
        message: "Coupon applied successfully",
        data: response,
      }
    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      }
    }
  }

  @Post()
  async create(@Body() createCouponDto: CreateCouponDto) {
    try {
      const response = await this.couponService.createCoupon(createCouponDto)
      return {
        status: "success",
        message: "Coupon created successfully",
        data: response,
      }
    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      }
    }
  }

  @Get()
  async findAll(@Query('limit', ParseIntPipe) limit?: number, @Query('offset', ParseIntPipe) offset?: number) {
    try {
      const response = await this.couponService.getCoupons(limit, offset)
      return {
        status: "success",
        message: "Coupons retrieved successfully",
        data: response,
      }
    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      }
    }
  }

  @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        try {
            const response = await this.couponService.getCouponById(id);
            return {
                status: 'success',
                message: 'Coupon retrieved successfully',
                data: response
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    }

  @Put(":id")
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateCouponDto: UpdateCouponDto) {
    try {
      const response = await this.couponService.updateCoupon(id, updateCouponDto)
      return {
        status: "success",
        message: "Coupon updated successfully",
        data: response,
      }
    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      }
    }
  }

  @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        try {
            const response = await this.couponService.deleteCoupon(id);
            return {
                status: 'success',
                message: 'Coupon deleted successfully',
                data: response
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    }

  @Delete()
    async removeMany(@Body('ids', new ParseArrayPipe({ items: Number, separator: ',' })) ids: number[]) {
        try {
            const response = await this.couponService.deleteMultipleCoupons(ids);
            return {
                status: 'success',
                message: 'Coupons deleted successfully',
                data: response
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    }
}
