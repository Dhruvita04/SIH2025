import { ConflictException, Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateCouponDto } from "./dto/create-coupon.dto"
import { UpdateCouponDto } from "./dto/update-coupon.dto"

@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) {}

  async applyCoupon(userId: string, couponCode: string, cartTotal: number) {
    try {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: couponCode },
      })

      if (!coupon) {
        throw new NotFoundException("Coupon not found")
      }

      // Check if coupon is active
      if (!coupon.isActive) {
        throw new BadRequestException("This coupon is not active")
      }

      // Check if coupon has expired
      const currentDate = new Date()
      if (currentDate < coupon.startDate || currentDate > coupon.endDate) {
        throw new BadRequestException("This coupon has expired or is not yet valid")
      }

      // Check if coupon has reached max uses limit
      if (coupon.maxUses && coupon.maxUses > 0 && coupon.uses >= coupon.maxUses) {
        throw new BadRequestException("This coupon has reached its maximum usage limit")
      }

      // Check minimum purchase amount
      if (coupon.minPurchaseAmount && cartTotal < Number(coupon.minPurchaseAmount)) {
        throw new BadRequestException(
          `Minimum purchase amount of ₹${coupon.minPurchaseAmount} required for this coupon`,
        )
      }

      // Check if coupon is user-specific and if user is allowed
      if (coupon.userIds.length > 0 && !coupon.userIds.includes(Number(userId))) {
        throw new BadRequestException("This coupon is not valid for your account")
      }

      // Note: Don't increment usage count here - it should be done when order is actually placed
      // The usage count increment should happen in the order creation process

      return {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        minPurchaseAmount: coupon.minPurchaseAmount ? Number(coupon.minPurchaseAmount) : null,
        productIds: coupon.productIds,
      }
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException("Error applying coupon")
    }
  }

  async createCoupon(dto: CreateCouponDto) {
    try {
      // Check if a coupon with the same code already exists
      const existingCoupon = await this.prisma.coupon.findUnique({
        where: { code: dto.code },
      })

      if (existingCoupon) {
        throw new ConflictException("A coupon with this code already exists")
      }

      // Validate dates
      if (new Date(dto.startDate) > new Date(dto.endDate)) {
        throw new BadRequestException("Start date must be before end date")
      }

      const coupon = await this.prisma.coupon.create({
        data: {
          ...dto,
          discountValue: dto.discountValue,
          minPurchaseAmount: dto.minPurchaseAmount,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
        },
      })

      return this.formatCouponData(coupon)
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error
      }
      throw new NotFoundException("Error creating coupon")
    }
  }

  async getCoupons(limit?: number, offset?: number) {
    try {
      const totalCount = await this.prisma.coupon.count()

      const coupons = await this.prisma.coupon.findMany({
        ...(limit && { take: limit }),
        ...(offset && { skip: offset }),
        orderBy: {
          createdAt: "desc",
        },
      })

      return {
        data: coupons.map((coupon) => this.formatCouponData(coupon)),
        totalCount,
      }
    } catch (error) {
      throw new NotFoundException("Error in getting coupons")
    }
  }

  async getCouponById(id: number) {
    try {
      const coupon = await this.prisma.coupon.findUnique({
        where: { id },
      })

      if (!coupon) {
        throw new NotFoundException("Coupon not found")
      }

      return this.formatCouponData(coupon)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new NotFoundException("Error getting coupon")
    }
  }

  async updateCoupon(id: number, dto: UpdateCouponDto) {
    try {
      const coupon = await this.prisma.coupon.findUnique({
        where: { id },
      })

      if (!coupon) {
        throw new NotFoundException("Coupon not found")
      }

      // If updating dates, validate them
      if (dto.startDate && dto.endDate) {
        if (new Date(dto.startDate) > new Date(dto.endDate)) {
          throw new BadRequestException("Start date must be before end date")
        }
      }

      // If updating code, check for uniqueness
      if (dto.code) {
        const existingCoupon = await this.prisma.coupon.findUnique({
          where: { code: dto.code },
        })

        if (existingCoupon && existingCoupon.id !== id) {
          throw new ConflictException("A coupon with this code already exists")
        }
      }

      const updatedCoupon = await this.prisma.coupon.update({
        where: { id },
        data: {
          ...dto,
          ...(dto.startDate && { startDate: new Date(dto.startDate) }),
          ...(dto.endDate && { endDate: new Date(dto.endDate) }),
        },
      })

      return this.formatCouponData(updatedCoupon)
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error
      }
      throw new NotFoundException("Error updating coupon")
    }
  }

  async deleteCoupon(id: number) {
    try {
      const coupon = await this.prisma.coupon.findUnique({
        where: { id },
      })

      if (!coupon) {
        throw new NotFoundException("Coupon not found")
      }

      const deletedCoupon = await this.prisma.coupon.delete({
        where: { id },
      })

      return this.formatCouponData(deletedCoupon)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new NotFoundException("Error deleting coupon")
    }
  }

  async deleteMultipleCoupons(ids: number[]) {
    try {
      const coupons = await this.prisma.coupon.findMany({
        where: { id: { in: ids } },
      })

      if (coupons.length === 0) {
        throw new NotFoundException("Coupons not found")
      }

      const deletedCoupons = await this.prisma.coupon.deleteMany({
        where: { id: { in: ids } },
      })

      return deletedCoupons
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new NotFoundException("Error deleting coupons")
    }
  }

  private formatCouponData(coupon: any) {
    return {
      ...coupon,
      discountValue: Number(coupon.discountValue),
      minPurchaseAmount: coupon.minPurchaseAmount ? Number(coupon.minPurchaseAmount) : null,
      startDate: coupon.startDate.toISOString(),
      endDate: coupon.endDate.toISOString(),
      createdAt: coupon.createdAt.toISOString(),
      updatedAt: coupon.updatedAt.toISOString(),
    }
  }
}
