import { BadRequestException, Injectable } from "@nestjs/common"
import { OrderStatus, PaymentStatus, Prisma, CouponType } from "@prisma/client"
import { PrismaService } from "src/prisma/prisma.service"
import { v4 as uuidv4 } from "uuid"
import { CreateOrderDto } from "./dto/CreateOrderDto.dto"
import { PdfService } from "src/utils/pdf.service"
import { ImageService } from "src/utils/image.service"
import { ShippedBatchDto } from "./dto/ShippedBatchDto.dto"

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly imageService: ImageService,
  ) {}

  async createOrder(order: CreateOrderDto) {
    return this.prisma.$transaction(
      async (tx) => {
        // 1. VALIDATE INPUT
        if (!order.addressId) {
          throw new BadRequestException("Address ID is required to create an order.")
        }
        if (!order.items || order.items.length === 0) {
          throw new BadRequestException("Order must contain at least one item.")
        }

        // 2. GENERATE ORDER ID
        const currentOrderId = uuidv4()
        const today = new Date()
        const datePrefix =
          today.getFullYear().toString() +
          (today.getMonth() + 1).toString().padStart(2, "0") +
          today.getDate().toString().padStart(2, "0")

        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

        const todayOrderCount = await tx.order.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lt: endOfDay,
            },
          },
        })

        const sequentialNumber = (todayOrderCount + 1).toString().padStart(6, "0")
        const userFriendlyOrderId = datePrefix + sequentialNumber

        // 3. GET ADDRESS & CREATE SNAPSHOT
        const userAddress = await tx.address.findUnique({
          where: { id: order.addressId },
        })

        if (!userAddress) {
          throw new BadRequestException("Shipping address not found with the provided ID.")
        }

        const shippingAddressSnapshot = await tx.shippingAddress.create({
          data: {
            userId: userAddress.userId,
            name: userAddress.name,
            phone: userAddress.phone,
            line1: userAddress.line1,
            line2: userAddress.line2,
            city: userAddress.city,
            state: userAddress.state,
            postalCode: userAddress.postalCode,
            default: userAddress.default,
          },
        })

        // 4. PROCESS ORDER ITEMS & CALCULATE TOTALS
        // Note: All prices are GST-inclusive from frontend
        const gstPercentage = Number.parseFloat(process.env.GST_PERCENTAGE || "18")
        const appStateCode = (process.env.STATE_CODE || "Maharashtra").trim().toUpperCase()

        let beCalculatedSubTotal = 0 // Sum of (original price - product discount) * quantity
        let beCalculatedProductDiscountTotal = 0 // Total product discount amount
        let beCalculatedCgst = 0
        let beCalculatedSgst = 0
        let beCalculatedIgst = 0
        const orderProductsData = []
        const stockUpdatePromises = []

        for (const item of order.items) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            include: { product: true },
          })

          if (!variant) {
            throw new BadRequestException(`Product variant with ID ${item.variantId} not found.`)
          }

          if (variant.stock < item.quantity) {
            throw new BadRequestException(
              `Not enough stock for ${variant.product.name} - ${variant.name}. Available: ${variant.stock}, Requested: ${item.quantity}.`,
            )
          }

          // All prices are GST-inclusive
          const originalPriceInclusive = variant.price
          let discountedPriceInclusive: number

          // Apply product discount based on type
          if (variant.discountType.toUpperCase() === "PERCENTAGE") {
            discountedPriceInclusive = originalPriceInclusive * (1 - variant.discount / 100)
          } else {
            // AMOUNT type
            discountedPriceInclusive = originalPriceInclusive - variant.discount
          }

          discountedPriceInclusive = Math.max(0, discountedPriceInclusive)
          const itemProductDiscount = originalPriceInclusive - discountedPriceInclusive
          const quantity = item.quantity

          beCalculatedProductDiscountTotal += itemProductDiscount * quantity

          const finalPriceInclusivePerUnit = Number.parseFloat(discountedPriceInclusive.toFixed(2))

          // Verify frontend sent correct price (this should match the discounted price)
          if (Math.abs(finalPriceInclusivePerUnit - item.price) > 0.01) {
            throw new BadRequestException(
              `Price mismatch for product ${variant.product.name} - ${variant.name}. Expected: ${finalPriceInclusivePerUnit}, Received: ${item.price}`,
            )
          }

          // Calculate subtotal (GST-inclusive price after product discount)
          const itemSubTotal = finalPriceInclusivePerUnit * quantity
          beCalculatedSubTotal += itemSubTotal

          // Calculate GST amounts for record keeping (from the discounted price)
          const exclusivePricePerUnit = finalPriceInclusivePerUnit / (1 + gstPercentage / 100)
          const gstAmountPerUnit = finalPriceInclusivePerUnit - exclusivePricePerUnit

          // Calculate CGST/SGST or IGST based on state
          if (userAddress.state.trim().toUpperCase() === appStateCode) {
            beCalculatedCgst += (gstAmountPerUnit / 2) * quantity
            beCalculatedSgst += (gstAmountPerUnit / 2) * quantity
          } else {
            beCalculatedIgst += gstAmountPerUnit * quantity
          }

          orderProductsData.push({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: finalPriceInclusivePerUnit, // GST-inclusive price after product discount
            originalPrice: originalPriceInclusive, // Original GST-inclusive price
            productDiscount: itemProductDiscount, // Product discount per unit
          })

          stockUpdatePromises.push(
            tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { decrement: item.quantity } },
            }),
          )
        }

        // Round all calculated values
        const beFinalSubTotal = Number.parseFloat(beCalculatedSubTotal.toFixed(2)) // GST-inclusive subtotal after product discounts
        const beFinalProductDiscount = Number.parseFloat(beCalculatedProductDiscountTotal.toFixed(2))
        const beFinalCgst = Number.parseFloat(beCalculatedCgst.toFixed(2))
        const beFinalSgst = Number.parseFloat(beCalculatedSgst.toFixed(2))
        const beFinalIgst = Number.parseFloat(beCalculatedIgst.toFixed(2))

        // 5. CALCULATE COUPON DISCOUNT
        let beCalculatedCouponDiscount = 0
        let appliedCoupon = null

        if (order.couponId) {
          appliedCoupon = await tx.coupon.findUnique({
            where: { code: order.couponId }, // Assuming couponId is actually the coupon code
          })

          if (!appliedCoupon) {
            throw new BadRequestException(`Coupon with code ${order.couponId} not found.`)
          }

          // Validate coupon
          if (!appliedCoupon.isActive) {
            throw new BadRequestException("This coupon is not active.")
          }

          const currentDate = new Date()
          if (currentDate < appliedCoupon.startDate || currentDate > appliedCoupon.endDate) {
            throw new BadRequestException("This coupon has expired or is not yet valid.")
          }

          // Check minimum purchase amount
          if (appliedCoupon.minPurchaseAmount && beFinalSubTotal < Number(appliedCoupon.minPurchaseAmount)) {
            throw new BadRequestException(
              `Minimum purchase amount of ₹${appliedCoupon.minPurchaseAmount} required for this coupon.`,
            )
          }

          // Calculate coupon discount based on type
          if (appliedCoupon.discountType === CouponType.PERCENTAGE) {
            beCalculatedCouponDiscount = (beFinalSubTotal * Number(appliedCoupon.discountValue)) / 100
          } else {
            // AMOUNT type
            beCalculatedCouponDiscount = Number(appliedCoupon.discountValue)
          }

          // Ensure coupon discount doesn't exceed subtotal
          beCalculatedCouponDiscount = Math.min(beCalculatedCouponDiscount, beFinalSubTotal)
          beCalculatedCouponDiscount = Number.parseFloat(beCalculatedCouponDiscount.toFixed(2))

          // Update coupon usage
          await tx.coupon.update({
            where: { id: appliedCoupon.id },
            data: { uses: { increment: 1 } },
          })
        }

        // 6. CALCULATE SHIPPING FROM ENVIRONMENT VARIABLES
        const minimumOrderForFreeShipping = Number.parseFloat(process.env.MINIMUM_ORDER_FREE_SHIPPING || "1000")
        const shippingAmount = Number.parseFloat(process.env.SHIPPING_AMOUNT || "50")

        // Calculate shipping based on subtotal AFTER coupon discount
        const subtotalAfterCouponDiscount = beFinalSubTotal - beCalculatedCouponDiscount
        const beCalculatedShipping = subtotalAfterCouponDiscount >= minimumOrderForFreeShipping ? 0 : shippingAmount

        // 7. CALCULATE FINAL ORDER TOTAL
        // Order Total = Subtotal - Coupon Discount + Shipping
        const beFinalOrderTotal = Number.parseFloat(
          (beFinalSubTotal - beCalculatedCouponDiscount + beCalculatedShipping).toFixed(2),
        )

        // 8. VERIFY FRONTEND CALCULATIONS
        const tolerance = 0.01

        // Verify subtotal (GST-inclusive amount after product discounts)
        if (Math.abs(order.subTotal - beFinalSubTotal) > tolerance) {
          throw new BadRequestException(`Subtotal mismatch. FE: ${order.subTotal}, BE: ${beFinalSubTotal}`)
        }

        // Verify coupon discount (only if coupon is provided)
        if (order.couponId && Math.abs(order.discount - beCalculatedCouponDiscount) > tolerance) {
          throw new BadRequestException(
            `Coupon discount mismatch. FE: ${order.discount}, BE: ${beCalculatedCouponDiscount}`,
          )
        }

        // If no coupon, frontend discount should be 0
        if (!order.couponId && order.discount > 0) {
          // Don't throw error, just ignore the frontend discount value
        }

        // Verify shipping
        if (Math.abs(order.shipping - beCalculatedShipping) > tolerance) {
          throw new BadRequestException(`Shipping mismatch. FE: ${order.shipping}, BE: ${beCalculatedShipping}`)
        }

        // Verify final total
        if (Math.abs(order.orderTotal - beFinalOrderTotal) > tolerance) {
          throw new BadRequestException(`Order total mismatch. FE: ${order.orderTotal}, BE: ${beFinalOrderTotal}`)
        }

        // 9. CREATE ORDER IN DATABASE
        const createdOrder = await tx.order.create({
          data: {
            id: currentOrderId,
            orderId: userFriendlyOrderId,
            date: new Date(),
            status: OrderStatus.PAYMENT_PENDING,
            subTotal: beFinalSubTotal, // GST-inclusive subtotal after product discounts
            discount: beFinalProductDiscount, // Total product discount amount (for reference)
            couponDiscount: beCalculatedCouponDiscount, // Coupon discount
            shipping: beCalculatedShipping,
            cgst: beFinalCgst, // For record keeping
            sgst: beFinalSgst, // For record keeping
            igst: beFinalIgst, // For record keeping
            orderTotal: beFinalOrderTotal, // Final amount to be paid
            paymentId: order.paymentId,
            prescriptionId: order.prescriptionId,
            user: {
              connect: {
                id: order.userId,
              },
            },
            shippingAddress: {
              connect: {
                id: shippingAddressSnapshot.id,
              },
            },
            couponId: order.couponId,
            products: {
              create: orderProductsData,
            },
          },
          include: {
            products: true,
            shippingAddress: true,
          },
        })

        // 10. EXECUTE STOCK UPDATES
        await Promise.all(stockUpdatePromises)

        // 11. RETURN CREATED ORDER
        return {
          ...createdOrder,
          message: "Order created successfully with PAYMENT_PENDING status",
        }
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    )
  }

  async getOrderStatus(id: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: {
          id,
        },
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
          shippingAddress: true,
          products: {
            include: {
              product: true,
              variant: true,
              shippedBatches: true, // Include shipped batches
            },
          },
          payment: true,
          shippedBatches: true, // Include order-level shipped batches
        },
      })

      if (!order) {
        throw new Error("Order not found")
      }

      const deliveryDays = Number.parseInt(process.env.DELIVERY_DAYS || "7", 10)
      const expectedDeliveryDate = new Date(order.date.getTime() + deliveryDays * 24 * 60 * 60 * 1000)

      const returnDaysLimit = Number.parseInt(process.env.RETURN_DAYS_LIMIT || "7", 10)
      const returnWindowEndDate = new Date(expectedDeliveryDate.getTime() + returnDaysLimit * 24 * 60 * 60 * 1000)

      const repaymentWindowMinutes = Number.parseInt(process.env.REPAYMENT_WINDOW_MINUTES || "30", 10)
      const orderCreationTime = new Date(order.createdAt)
      const now = new Date()
      const minutesSinceCreation = (now.getTime() - orderCreationTime.getTime()) / (1000 * 60)

      const canRetryPayment =
        order.status === OrderStatus.PAYMENT_FAILED && minutesSinceCreation <= repaymentWindowMinutes

      const canCancel = order.status === OrderStatus.PLACED || order.status === OrderStatus.PAYMENT_PENDING
      const canReturn = order.status === OrderStatus.DELIVERED && new Date() <= returnWindowEndDate

      const pdf = await this.pdfService.generateOrderPdf(order)

      return {
        details: this.formatDatesInObject({
          ...order,
          userActions: {
            canCancel,
            canReturn,
            canRetryPayment,
          },
        }),
        pdf: pdf,
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  async getAllOrders(
    page: number,
    limit: number,
    search?: string,
    status?: string,
    fromDate?: string,
    toDate?: string,
  ) {
    try {
      const skip = (page - 1) * limit

      const where: Prisma.OrderWhereInput = {
        ...(search && {
          OR: [
            { orderId: { contains: search, mode: "insensitive" } },
            { user: { name: { contains: search, mode: "insensitive" } } },
            { user: { email: { contains: search, mode: "insensitive" } } },
            { shippingAddress: { name: { contains: search, mode: "insensitive" } } },
          ],
        }),
        ...(status && status !== "ALL" && { status: status as OrderStatus }),
      }

      const dateFilter: { gte?: Date; lte?: Date } = {}
      if (fromDate) {
        const startDate = new Date(fromDate)
        startDate.setUTCHours(0, 0, 0, 0)
        dateFilter.gte = startDate
      }
      if (toDate) {
        const endDate = new Date(toDate)
        endDate.setUTCHours(23, 59, 59, 999)
        dateFilter.lte = endDate
      }

      if (Object.keys(dateFilter).length > 0) {
        where.createdAt = dateFilter
      }

      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            shippingAddress: true,
            products: {
              include: {
                product: true,
                variant: true,
                shippedBatches: true, // Include shipped batches
              },
            },
            payment: true,
            shippedBatches: true, // Include order-level shipped batches
          },
        }),
        this.prisma.order.count({ where }),
      ])

      // Generate PDF for each order
      const ordersWithPdf = await Promise.all(
        orders.map(async (order) => {
          const pdf = await this.pdfService.generateOrderPdf(order)
          return {
            ...order,
            pdf,
          }
        }),
      )

      return {
        orders: this.formatDatesInObject(ordersWithPdf),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  async getOrderDetails(id: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              googleId: true,
              createdAt: true,
              updatedAt: true,
              phone: true,
              isVerified: true,
              role: true,
              profile: true,
            },
          },
          shippingAddress: true,
          products: {
            include: {
              product: {
                include: {
                  brand: true,
                  category: true,
                },
              },
              variant: true,
              shippedBatches: true, // Include shipped batches for each product
            },
          },
          payment: true,
          shippedBatches: true, // Include order-level shipped batches
        },
      })

      if (!order) {
        throw new Error("Order not found")
      }

      if (order.user && !order.user.phone && order.shippingAddress && order.shippingAddress.phone) {
        order.user.phone = order.shippingAddress.phone
      }

      // Calculate accurate order summary based on stored values and order products
      let originalPriceTotal = 0 // Sum of all products at original price
      let productDiscountTotal = 0 // Total product discount amount

      // Calculate from order products for accuracy
      for (const orderProduct of order.products) {
        const itemOriginalPrice = orderProduct.originalPrice * orderProduct.quantity
        const itemProductDiscount = orderProduct.productDiscount * orderProduct.quantity

        originalPriceTotal += itemOriginalPrice
        productDiscountTotal += itemProductDiscount
      }

      // Round the calculated values
      originalPriceTotal = Number.parseFloat(originalPriceTotal.toFixed(2))
      productDiscountTotal = Number.parseFloat(productDiscountTotal.toFixed(2))

      // Calculate subtotal (original price - product discount)
      const subtotalAfterProductDiscount = Number.parseFloat((originalPriceTotal - productDiscountTotal).toFixed(2))

      const orderSummary = {
        originalPrice: originalPriceTotal, // Sum of all products at original price
        productDiscount: productDiscountTotal, // Total product discount amount
        subtotal: subtotalAfterProductDiscount, // Original price - product discount (should match stored subTotal)
        couponDiscount: order.couponDiscount || 0, // Coupon discount amount
        shipping: order.shipping || 0, // Shipping amount
        total: order.orderTotal, // Final total amount (subtotal - coupon discount + shipping)
        // GST breakdown for reference (these are calculated from the discounted prices)
        cgst: order.cgst || 0,
        sgst: order.sgst || 0,
        igst: order.igst || 0,
      }

      // Verify our calculations match stored values (for debugging)
      if (Math.abs(subtotalAfterProductDiscount - order.subTotal) > 0.01) {
        console.warn(
          `Subtotal calculation mismatch: Calculated=${subtotalAfterProductDiscount}, Stored=${order.subTotal}`,
        )
      }

      let prescriptionDetails = null
      if (order.prescriptionId) {
        const prescription = await this.prisma.prescription.findUnique({
          where: { id: order.prescriptionId },
          select: {
            id: true,
            patientName: true,
            patientAge: true,
            patientGender: true,
            patientBloodGroup: true,
            patientHeight: true,
            patientWeight: true,
            prescriptionUrl: true,
            doctorName: true,
            createdAt: true,
            updatedAt: true,
          },
        })

        if (prescription) {
          try {
            const signedUrl = await this.imageService.getSignedUrl("prescriptions", prescription.prescriptionUrl, 60)
            prescriptionDetails = {
              ...prescription,
              prescriptionUrl: signedUrl,
            }
          } catch (error) {
            console.error("Error getting signed URL:", error)
            prescriptionDetails = {
              ...prescription,
              prescriptionUrl: prescription.prescriptionUrl,
              signedUrlError: "Failed to generate signed URL",
            }
          }
        }
      }

      let shippingDetails = null
      if (order.shippingDetailsId) {
        shippingDetails = await this.prisma.shippingDetails.findUnique({
          where: { id: order.shippingDetailsId },
        })
      }

      const availableStatuses: OrderStatus[] = []
      const currentStatus = order.status

      // FIXED: Only allow direct transitions, not chained transitions
      switch (currentStatus) {
        case OrderStatus.PAYMENT_PENDING:
          availableStatuses.push(OrderStatus.PAYMENT_FAILED, OrderStatus.PLACED)
          break
        case OrderStatus.PAYMENT_FAILED:
          // PAYMENT_FAILED orders cannot be moved to PLACED - they must go through payment process again
          availableStatuses.push(OrderStatus.PAYMENT_PENDING)
          break
        case OrderStatus.PLACED:
          availableStatuses.push(
            OrderStatus.SHIPPED,
            OrderStatus.REFUNDED,
            OrderStatus.PAYMENT_FAILED,
            OrderStatus.PAYMENT_PENDING,
          )
          break
        case OrderStatus.SHIPPED:
          availableStatuses.push(OrderStatus.IN_TRANSIT, OrderStatus.PLACED)
          break
        case OrderStatus.IN_TRANSIT:
          availableStatuses.push(OrderStatus.DELIVERED, OrderStatus.SHIPPED)
          break
        case OrderStatus.DELIVERED:
          availableStatuses.push(OrderStatus.RETURNED, OrderStatus.IN_TRANSIT)
          break
        case OrderStatus.RETURNED:
          availableStatuses.push(OrderStatus.REFUNDED, OrderStatus.DELIVERED)
          break
        case OrderStatus.REFUNDED:
          availableStatuses.push(OrderStatus.RETURNED)
          break
        default:
          break
      }

      const deliveryDays = Number.parseInt(process.env.DELIVERY_DAYS || "7", 10)
      const expectedDeliveryDate = new Date(order.date.getTime() + deliveryDays * 24 * 60 * 60 * 1000)

      const returnDaysLimit = Number.parseInt(process.env.RETURN_DAYS_LIMIT || "7", 10)
      const returnWindowEndDate = new Date(expectedDeliveryDate.getTime() + returnDaysLimit * 24 * 60 * 60 * 1000)

      const repaymentWindowMinutes = Number.parseInt(process.env.REPAYMENT_WINDOW_MINUTES || "30", 10)
      const orderCreationTime = new Date(order.createdAt)
      const now = new Date()
      const minutesSinceCreation = (now.getTime() - orderCreationTime.getTime()) / (1000 * 60)

      const canRetryPayment =
        order.status === OrderStatus.PAYMENT_FAILED && minutesSinceCreation <= repaymentWindowMinutes

      const canCancel = order.status === OrderStatus.PLACED || order.status === OrderStatus.PAYMENT_PENDING
      const canReturn = order.status === OrderStatus.DELIVERED && new Date() <= returnWindowEndDate

      const pdf = await this.pdfService.generateOrderPdf(order)

      // FIXED: Generate status history based on actual order progression, not allowing invalid chains
      let statusHistoryString: string

      // Generate status history based on current status only
      switch (currentStatus) {
        case OrderStatus.PAYMENT_PENDING:
          statusHistoryString = "PAYMENT_PENDING"
          break
        case OrderStatus.PAYMENT_FAILED:
          statusHistoryString = "PAYMENT_PENDING -> PAYMENT_FAILED"
          break
        case OrderStatus.PLACED:
          // Check if order went through payment failure first
          if (order.payment && order.payment.status === "FAILED") {
            statusHistoryString = "PAYMENT_PENDING -> PAYMENT_FAILED -> PLACED"
          } else {
            statusHistoryString = "PAYMENT_PENDING -> PLACED"
          }
          break
        case OrderStatus.SHIPPED:
          if (order.payment && order.payment.status === "FAILED") {
            statusHistoryString = "PAYMENT_PENDING -> PAYMENT_FAILED -> PLACED -> SHIPPED"
          } else {
            statusHistoryString = "PAYMENT_PENDING -> PLACED -> SHIPPED"
          }
          break
        case OrderStatus.IN_TRANSIT:
          if (order.payment && order.payment.status === "FAILED") {
            statusHistoryString = "PAYMENT_PENDING -> PAYMENT_FAILED -> PLACED -> SHIPPED -> IN_TRANSIT"
          } else {
            statusHistoryString = "PAYMENT_PENDING -> PLACED -> SHIPPED -> IN_TRANSIT"
          }
          break
        case OrderStatus.DELIVERED:
          if (order.payment && order.payment.status === "FAILED") {
            statusHistoryString = "PAYMENT_PENDING -> PAYMENT_FAILED -> PLACED -> SHIPPED -> IN_TRANSIT -> DELIVERED"
          } else {
            statusHistoryString = "PAYMENT_PENDING -> PLACED -> SHIPPED -> IN_TRANSIT -> DELIVERED"
          }
          break
        case OrderStatus.RETURNED:
          if (order.payment && order.payment.status === "FAILED") {
            statusHistoryString =
              "PAYMENT_PENDING -> PAYMENT_FAILED -> PLACED -> SHIPPED -> IN_TRANSIT -> DELIVERED -> RETURNED"
          } else {
            statusHistoryString = "PAYMENT_PENDING -> PLACED -> SHIPPED -> IN_TRANSIT -> DELIVERED -> RETURNED"
          }
          break
        case OrderStatus.REFUNDED:
          // Check if the order had shipping details (implying it went through shipping/delivery/return)
          if (shippingDetails && (shippingDetails.trackingNumber || shippingDetails.trackingURL)) {
            if (order.payment && order.payment.status === "FAILED") {
              statusHistoryString =
                "PAYMENT_PENDING -> PAYMENT_FAILED -> PLACED -> SHIPPED -> IN_TRANSIT -> DELIVERED -> RETURNED -> REFUNDED"
            } else {
              statusHistoryString =
                "PAYMENT_PENDING -> PLACED -> SHIPPED -> IN_TRANSIT -> DELIVERED -> RETURNED -> REFUNDED"
            }
          } else {
            // Refunded directly from PLACED
            if (order.payment && order.payment.status === "FAILED") {
              statusHistoryString = "PAYMENT_PENDING -> PAYMENT_FAILED -> PLACED -> REFUNDED"
            } else {
              statusHistoryString = "PAYMENT_PENDING -> PLACED -> REFUNDED"
            }
          }
          break
        default:
          statusHistoryString = currentStatus
          break
      }

      // Create a clean order object without redundant pricing fields
      const { subTotal, discount, couponDiscount, shipping, cgst, sgst, igst, orderTotal, ...cleanOrder } = order

      return this.formatDatesInObject({
        ...cleanOrder,
        orderSummary, // Use the corrected order summary with all pricing information
        prescriptionDetails,
        availableStatuses,
        shippingDetails,
        expectedDeliveryDate,
        userActions: {
          canCancel,
          canReturn,
          canRetryPayment,
        },
        pdf,
        statusHistory: statusHistoryString,
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  // NEW: Add batches to order (before changing status to SHIPPED)
  async addBatchesToOrder(orderId: string, shippedBatches: ShippedBatchDto[]) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          products: {
            include: {
              product: true, // Include product to get HSN code
            },
          },
        },
      })

      if (!order) {
        throw new BadRequestException("Order not found.")
      }

      // Only allow adding batches to PLACED orders
      if (order.status !== OrderStatus.PLACED) {
        throw new BadRequestException("Batches can only be added to orders with PLACED status.")
      }

      if (!shippedBatches || shippedBatches.length === 0) {
        throw new BadRequestException("At least one batch is required.")
      }

      // Validate that all orderProductIds exist in the order
      const orderProductIds = order.products.map((p) => p.id)
      const batchOrderProductIds = shippedBatches.map((b) => b.orderProductId)

      const invalidIds = batchOrderProductIds.filter((id) => !orderProductIds.includes(id))
      if (invalidIds.length > 0) {
        throw new BadRequestException(`Invalid order product IDs: ${invalidIds.join(", ")}`)
      }

      // Validate that batch quantities don't exceed order quantities
      const quantityValidation = new Map<string, number>()

      // Sum up quantities for each order product from batches
      for (const batch of shippedBatches) {
        const currentQty = quantityValidation.get(batch.orderProductId) || 0
        quantityValidation.set(batch.orderProductId, currentQty + batch.quantity)
      }

      // Check against actual order quantities
      for (const orderProduct of order.products) {
        const batchTotalQty = quantityValidation.get(orderProduct.id) || 0
        if (batchTotalQty > orderProduct.quantity) {
          throw new BadRequestException(
            `Batch quantities (${batchTotalQty}) exceed order quantity (${orderProduct.quantity}) for order product ${orderProduct.id}`,
          )
        }
      }

      return await this.prisma.$transaction(async (tx) => {
        // Create new shipped batches with HSN codes from products
        const batchData = shippedBatches.map((batch) => {
          // Find the corresponding order product to get the HSN code
          const orderProduct = order.products.find((p) => p.id === batch.orderProductId)
          const hsnCode = orderProduct?.product?.hsnCode || null

          return {
            orderId: orderId,
            orderProductId: batch.orderProductId,
            batchNumber: batch.batchNumber,
            expiryDate: new Date(batch.expiryDate),
            quantity: batch.quantity,
            hsnCode: hsnCode, // Automatically store HSN from product
          }
        })

        const createdBatches = await tx.shippedBatch.createMany({
          data: batchData,
        })

        for (const batch of shippedBatches) {
          const orderProduct = order.products.find((p) => p.id === batch.orderProductId)
          if (orderProduct) {
            const newExpiryDate = new Date(batch.expiryDate)
            const existingBatch = await tx.productBatch.findFirst({
              where: {
                productId: orderProduct.productId,
                variantId: orderProduct.variantId,
                batchNo: batch.batchNumber,
                expiryDate: newExpiryDate,
              },
            })

            // Only create if no exact duplicate exists
            if (!existingBatch) {
              await tx.productBatch.create({
                data: {
                  productId: orderProduct.productId,
                  variantId: orderProduct.variantId,
                  batchNo: batch.batchNumber,
                  expiryDate: newExpiryDate,
                },
              })
            }
          }
        }

        // Fetch the created batches to return
        const batches = await tx.shippedBatch.findMany({
          where: { orderId: orderId },
          include: {
            orderProduct: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    hsnCode: true,
                  },
                },
                variant: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        })

        return this.formatDatesInObject({
          orderId,
          batchesAdded: createdBatches.count,
          batches,
        })
      })
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new Error(error)
    }
  }

  // NEW: Update batches for order (before changing status to SHIPPED)
  async updateOrderBatches(orderId: string, shippedBatches: ShippedBatchDto[]) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          products: {
            include: {
              product: true, // Include product to get HSN code
            },
          },
        },
      })

      if (!order) {
        throw new BadRequestException("Order not found.")
      }

      // Only allow updating batches for PLACED orders
      if (order.status !== OrderStatus.PLACED) {
        throw new BadRequestException("Batches can only be updated for orders with PLACED status.")
      }

      if (!shippedBatches || shippedBatches.length === 0) {
        throw new BadRequestException("At least one batch is required.")
      }

      // Validate that all orderProductIds exist in the order
      const orderProductIds = order.products.map((p) => p.id)
      const batchOrderProductIds = shippedBatches.map((b) => b.orderProductId)

      const invalidIds = batchOrderProductIds.filter((id) => !orderProductIds.includes(id))
      if (invalidIds.length > 0) {
        throw new BadRequestException(`Invalid order product IDs: ${invalidIds.join(", ")}`)
      }

      // Validate that batch quantities don't exceed order quantities
      const quantityValidation = new Map<string, number>()

      // Sum up quantities for each order product from batches
      for (const batch of shippedBatches) {
        const currentQty = quantityValidation.get(batch.orderProductId) || 0
        quantityValidation.set(batch.orderProductId, currentQty + batch.quantity)
      }

      // Check against actual order quantities
      for (const orderProduct of order.products) {
        const batchTotalQty = quantityValidation.get(orderProduct.id) || 0
        if (batchTotalQty > orderProduct.quantity) {
          throw new BadRequestException(
            `Batch quantities (${batchTotalQty}) exceed order quantity (${orderProduct.quantity}) for order product ${orderProduct.id}`,
          )
        }
      }

      return await this.prisma.$transaction(async (tx) => {
        // Delete existing batches for this order
        await tx.shippedBatch.deleteMany({
          where: { orderId: orderId },
        })

        // Create new shipped batches with HSN codes from products
        const batchData = shippedBatches.map((batch) => {
          // Find the corresponding order product to get the HSN code
          const orderProduct = order.products.find((p) => p.id === batch.orderProductId)
          const hsnCode = orderProduct?.product?.hsnCode || null

          return {
            orderId: orderId,
            orderProductId: batch.orderProductId,
            batchNumber: batch.batchNumber,
            expiryDate: new Date(batch.expiryDate),
            quantity: batch.quantity,
            hsnCode: hsnCode, // Automatically store HSN from product
          }
        })

        const createdBatches = await tx.shippedBatch.createMany({
          data: batchData,
        })

        for (const batch of shippedBatches) {
          const orderProduct = order.products.find((p) => p.id === batch.orderProductId)
          if (orderProduct) {
            const newExpiryDate = new Date(batch.expiryDate)
            const existingBatch = await tx.productBatch.findFirst({
              where: {
                productId: orderProduct.productId,
                variantId: orderProduct.variantId,
                batchNo: batch.batchNumber,
                expiryDate: newExpiryDate,
              },
            })

            // Only create if no exact duplicate exists
            if (!existingBatch) {
              await tx.productBatch.create({
                data: {
                  productId: orderProduct.productId,
                  variantId: orderProduct.variantId,
                  batchNo: batch.batchNumber,
                  expiryDate: newExpiryDate,
                },
              })
            }
          }
        }

        // Fetch the updated batches to return
        const batches = await tx.shippedBatch.findMany({
          where: { orderId: orderId },
          include: {
            orderProduct: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    hsnCode: true,
                  },
                },
                variant: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        })

        return this.formatDatesInObject({
          orderId,
          batchesUpdated: createdBatches.count,
          batches,
        })
      })
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new Error(error)
    }
  }

  // New method to handle order status updates with batch tracking
  async updateOrderStatusWithBatches(
    orderId: string,
    newStatus: OrderStatus,
    trackingDetails?: {
      trackingURL?: string
      trackingNumber?: string
      courierName?: string
      shippedBatches?: ShippedBatchDto[]
    },
  ) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          products: {
            include: {
              product: true, // Include product to get HSN code
            },
          },
          shippedBatches: true, // Include existing batches
        },
      })

      if (!order) {
        throw new BadRequestException("Order not found.")
      }

      const availableStatuses: OrderStatus[] = []
      const currentStatus = order.status

      // FIXED: Only allow direct transitions, not chained transitions
      switch (currentStatus) {
        case OrderStatus.PAYMENT_PENDING:
          availableStatuses.push(OrderStatus.PAYMENT_FAILED, OrderStatus.PLACED)
          break
        case OrderStatus.PAYMENT_FAILED:
          // PAYMENT_FAILED orders cannot be moved to PLACED - they must go through payment process again
          availableStatuses.push(OrderStatus.PAYMENT_PENDING)
          break
        case OrderStatus.PLACED:
          availableStatuses.push(
            OrderStatus.SHIPPED,
            OrderStatus.REFUNDED,
            OrderStatus.PAYMENT_FAILED,
            OrderStatus.PAYMENT_PENDING,
          )
          break
        case OrderStatus.SHIPPED:
          availableStatuses.push(OrderStatus.IN_TRANSIT, OrderStatus.PLACED)
          break
        case OrderStatus.IN_TRANSIT:
          availableStatuses.push(OrderStatus.DELIVERED, OrderStatus.SHIPPED)
          break
        case OrderStatus.DELIVERED:
          availableStatuses.push(OrderStatus.RETURNED, OrderStatus.IN_TRANSIT)
          break
        case OrderStatus.RETURNED:
          availableStatuses.push(OrderStatus.REFUNDED, OrderStatus.DELIVERED)
          break
        case OrderStatus.REFUNDED:
          availableStatuses.push(OrderStatus.RETURNED)
          break
        default:
          break
      }

      if (!availableStatuses.includes(newStatus)) {
        // Add specific error message for PAYMENT_FAILED to PLACED transition
        if (currentStatus === OrderStatus.PAYMENT_FAILED && newStatus === OrderStatus.PLACED) {
          throw new BadRequestException(
            `Orders with PAYMENT_FAILED status cannot be directly moved to PLACED. The payment must be completed successfully first. Please use the payment retry functionality or update status to PAYMENT_PENDING.`,
          )
        }
        throw new BadRequestException(`Invalid status transition from ${currentStatus} to ${newStatus}.`)
      }

      return await this.prisma.$transaction(async (tx) => {
        const dataToUpdate: Prisma.OrderUpdateInput = { status: newStatus }

        if (newStatus === OrderStatus.SHIPPED) {
          if (
            !trackingDetails ||
            !trackingDetails.trackingURL ||
            !trackingDetails.trackingNumber ||
            !trackingDetails.courierName
          ) {
            throw new BadRequestException(
              "Tracking URL, tracking number, and courier name are required when status is SHIPPED.",
            )
          }

          // Check if batches already exist or are provided
          const existingBatches = order.shippedBatches || []
          const providedBatches = trackingDetails.shippedBatches || []

          if (existingBatches.length === 0 && providedBatches.length === 0) {
            throw new BadRequestException(
              "Shipped batches are required when status is SHIPPED. Please add batches first or provide them in the request.",
            )
          }

          // If batches are provided in the request, validate and use them
          if (providedBatches.length > 0) {
            // Validate that all orderProductIds exist in the order
            const orderProductIds = order.products.map((p) => p.id)
            const batchOrderProductIds = providedBatches.map((b) => b.orderProductId)

            const invalidIds = batchOrderProductIds.filter((id) => !orderProductIds.includes(id))
            if (invalidIds.length > 0) {
              throw new BadRequestException(`Invalid order product IDs: ${invalidIds.join(", ")}`)
            }

            // Validate that batch quantities don't exceed order quantities
            const quantityValidation = new Map<string, number>()

            // Sum up quantities for each order product from batches
            for (const batch of providedBatches) {
              const currentQty = quantityValidation.get(batch.orderProductId) || 0
              quantityValidation.set(batch.orderProductId, currentQty + batch.quantity)
            }

            // Check against actual order quantities
            for (const orderProduct of order.products) {
              const batchTotalQty = quantityValidation.get(orderProduct.id) || 0
              if (batchTotalQty > orderProduct.quantity) {
                throw new BadRequestException(
                  `Batch quantities (${batchTotalQty}) exceed order quantity (${orderProduct.quantity}) for order product ${orderProduct.id}`,
                )
              }
            }

            // Delete existing shipped batches for this order (in case of re-shipping)
            await tx.shippedBatch.deleteMany({
              where: { orderId: orderId },
            })

            // Create new shipped batches with HSN codes from products
            const batchData = providedBatches.map((batch) => {
              // Find the corresponding order product to get the HSN code
              const orderProduct = order.products.find((p) => p.id === batch.orderProductId)
              const hsnCode = orderProduct?.product?.hsnCode || null

              return {
                orderId: orderId,
                orderProductId: batch.orderProductId,
                batchNumber: batch.batchNumber,
                expiryDate: new Date(batch.expiryDate),
                quantity: batch.quantity,
                hsnCode: hsnCode, // Automatically store HSN from product
              }
            })

            await tx.shippedBatch.createMany({
              data: batchData,
            })

            for (const batch of providedBatches) {
              const orderProduct = order.products.find((p) => p.id === batch.orderProductId)
              if (orderProduct) {
                const existingBatch = await tx.productBatch.findFirst({
                  where: {
                    productId: orderProduct.productId,
                    variantId: orderProduct.variantId,
                    batchNo: batch.batchNumber,
                  },
                })

                // Only create if no existing batch OR if expiry date is different
                const newExpiryDate = new Date(batch.expiryDate)
                const shouldCreate = !existingBatch || existingBatch.expiryDate.getTime() !== newExpiryDate.getTime()

                if (shouldCreate) {
                  await tx.productBatch.create({
                    data: {
                      productId: orderProduct.productId,
                      variantId: orderProduct.variantId,
                      batchNo: batch.batchNumber,
                      expiryDate: newExpiryDate,
                    },
                  })
                }
              }
            }
          }

          // Handle shipping details
          if (order.shippingDetailsId) {
            await tx.shippingDetails.update({
              where: { id: order.shippingDetailsId },
              data: {
                trackingURL: trackingDetails.trackingURL,
                trackingNumber: trackingDetails.trackingNumber,
                courierName: trackingDetails.courierName,
                orderId: order.id,
              },
            })
          } else {
            const newShippingDetails = await tx.shippingDetails.create({
              data: {
                orderId: order.id,
                trackingURL: trackingDetails.trackingURL,
                trackingNumber: trackingDetails.trackingNumber,
                courierName: trackingDetails.courierName,
              },
            })
            dataToUpdate.shippingDetailsId = newShippingDetails.id
          }
        } else if (newStatus === OrderStatus.PLACED) {
          // Clear shipping details and batches when moving back to PLACED
          if (order.shippingDetailsId) {
            await tx.shippingDetails.update({
              where: { id: order.shippingDetailsId },
              data: {
                trackingURL: null,
                trackingNumber: null,
                courierName: null,
              },
            })
          }

          // Delete shipped batches when moving back to PLACED
          await tx.shippedBatch.deleteMany({
            where: { orderId: orderId },
          })
        }

        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: dataToUpdate,
          include: {
            shippedBatches: true,
            products: {
              include: {
                shippedBatches: true,
                product: true,
                variant: true,
              },
            },
          },
        })

        return this.formatDatesInObject(updatedOrder)
      })
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new Error(error)
    }
  }

  // Keep the original method for backward compatibility
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    trackingDetails?: { trackingURL?: string; trackingNumber?: string; courierName?: string },
  ) {
    return this.updateOrderStatusWithBatches(orderId, newStatus, trackingDetails)
  }

  async getUserOrders(id: string, page: number, limit: number, status?: string) {
    try {
      const skip = (page - 1) * limit

      // Build where clause
      const where: Prisma.OrderWhereInput = {
        userId: id,
        ...(status && status !== "ALL" && { status: status as OrderStatus }),
      }

      // Get total count and orders in parallel
      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            orderId: true,
            orderNumber: true,
            prescriptionId: true,
            userId: true,
            date: true,
            status: true,
            shippingAddressId: true,
            couponId: true,
            subTotal: true,
            discount: true,
            couponDiscount: true,
            shipping: true,
            cgst: true,
            sgst: true,
            igst: true,
            orderTotal: true,
            createdAt: true,
            updatedAt: true,
            shippingDetailsId: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            shippingAddress: true,
            payment: {
              select: {
                id: true,
                method: true,
                gateway: true,
                status: true,
                transactionId: true,
                gatewayOrderId: true,
                paymentSessionId: true,
                amount: true,
                currency: true,
                paymentDate: true,
                confirmationDate: true,
                errorMessage: true,
                isRefunded: true,
                refundDate: true,
              },
            },
            shippedBatches: true, // Include shipped batches in user orders
          },
        }),
        this.prisma.order.count({ where }),
      ])

      const deliveryDays = Number.parseInt(process.env.DELIVERY_DAYS || "7", 10)
      const returnDaysLimit = Number.parseInt(process.env.RETURN_DAYS_LIMIT || "7", 10)

      const ordersWithEstimatedDateAndActions = orders.map((order) => {
        const estimatedDeliveryDate = new Date(order.createdAt.getTime() + deliveryDays * 24 * 60 * 60 * 1000)
        const returnWindowEndDate = new Date(estimatedDeliveryDate.getTime() + returnDaysLimit * 24 * 60 * 60 * 1000)

        const repaymentWindowMinutes = Number.parseInt(process.env.REPAYMENT_WINDOW_MINUTES || "30", 10)
        const orderCreationTime = new Date(order.createdAt)
        const now = new Date()
        const minutesSinceCreation = (now.getTime() - orderCreationTime.getTime()) / (1000 * 60)
        const canRetryPayment =
          order.status === OrderStatus.PAYMENT_FAILED && minutesSinceCreation <= repaymentWindowMinutes

        const canCancel = order.status === OrderStatus.PLACED || order.status === OrderStatus.PAYMENT_PENDING
        const canReturn = order.status === OrderStatus.DELIVERED && new Date() <= returnWindowEndDate

        return {
          ...order,
          estimatedDeliveryDate,
          userActions: {
            canCancel,
            canReturn,
            canRetryPayment,
          },
        }
      })

      return {
        orders: this.formatDatesInObject(ordersWithEstimatedDateAndActions),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  async updateOrderStatusByPayment(orderId: string, paymentStatus: PaymentStatus) {
    try {
      let newOrderStatus: OrderStatus
      switch (paymentStatus) {
        case PaymentStatus.COMPLETED:
          newOrderStatus = OrderStatus.PLACED
          break
        case PaymentStatus.FAILED:
          newOrderStatus = OrderStatus.PAYMENT_FAILED
          break
        case PaymentStatus.PENDING:
          newOrderStatus = OrderStatus.PAYMENT_PENDING
          break
        default:
          return // Don't update if status is not recognized
      }

      // Update order status based on payment status
      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: newOrderStatus,
          updatedAt: new Date(),
        },
      })

      console.log(`Order ${orderId} status updated to ${newOrderStatus} based on payment status ${paymentStatus}`)
      return updatedOrder
    } catch (error) {
      console.error(`Error updating order status for order ${orderId}:`, error)
      throw error
    }
  }

  private formatDatesInObject(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj
    }

    if (obj instanceof Date) {
      return obj.toISOString()
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.formatDatesInObject(item))
    }

    if (typeof obj === "object") {
      const newObj: any = {}
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          newObj[key] = this.formatDatesInObject(obj[key])
        }
      }
      return newObj
    }

    return obj
  }

  async getBatchSuggestions(productId: string, variantId: string, batchNo?: string) {
    const whereClause: any = {
      productId,
      variantId,
    }

    // Add search functionality if batchNo is provided
    if (batchNo) {
      whereClause.batchNo = {
        contains: batchNo,
        mode: "insensitive",
      }
    }

    const batches = await this.prisma.productBatch.findMany({
      where: whereClause,
      orderBy: {
        batchNo: "desc",
      },
      select: {
        id: true,
        batchNo: true,
        expiryDate: true,
      },
    })

    return this.formatDatesInObject(batches)
  }
}
