import { Controller, Post, UseGuards, Get, Body, Param, Req, Query } from "@nestjs/common"
import { JwtAuthGuard } from "../auth/jwt-auth.guard"
import { PaymentsService } from "./payments.service"
import { CreatePaymentDto } from "./dto/create-payment.dto"
import { PrismaService } from "../prisma/prisma.service"
import { OrdersService } from "../orders/orders.service"
import { CreateOrderDto } from "../orders/dto/CreateOrderDto.dto"
import { RetryPaymentDto } from "./dto/retry-payment.dto"
import { RolesGuard } from "../auth/roles.guard"
import { Roles } from "../auth/roles.decorator"
import { type PaymentStatus, Role } from "@prisma/client"

@Controller("payment")
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
  ) {}

  /**
   * Frontend Request Format:
   * {
   *   "addressId": "address_id",
   *   "couponId": "coupon_code", // optional
   *   "prescriptionId": "prescription_id", // optional
   *   "subTotal": 290, // Sum of all (item.price * item.quantity) - GST INCLUSIVE
   *   "discount": 60, // Coupon discount amount
   *   "shipping": 50, // Shipping cost
   *   "orderTotal": 280, // subTotal - discount + shipping
   *   "items": [
   *     {
   *       "productId": "product_id",
   *       "variantId": "variant_id",
   *       "quantity": 1,
   *       "price": 290 // Final discounted price per unit (GST INCLUSIVE)
   *     }
   *   ]
   * }
   *
   * Note: All prices are GST INCLUSIVE. Backend calculates and handles all GST breakdown internally.
   * Frontend no longer needs to send cgst, sgst, or igst fields.
   */
  @UseGuards(JwtAuthGuard)
  @Post("create-order")
  async createCashfreeOrder(@Req() req, @Body() createPaymentDto: CreatePaymentDto) {
    try {
      const { id: userId, email, name } = req.user
      let { phone } = req.user

      // First, create the order in database with PAYMENT_PENDING status
      const orderData: CreateOrderDto = {
        userId,
        addressId: createPaymentDto.addressId,
        couponId: createPaymentDto.couponId,
        prescriptionId: createPaymentDto.prescriptionId,
        subTotal: createPaymentDto.subTotal,
        discount: createPaymentDto.discount,
        shipping: createPaymentDto.shipping,
        orderTotal: createPaymentDto.orderTotal,
        items: createPaymentDto.items,
      }

      // Create order using OrdersService
      const createdOrder = await this.ordersService.createOrder(orderData)

      // If phone is not available in user object, get it from order's shipping address
      if (!phone && createdOrder.shippingAddress?.phone) {
        phone = createdOrder.shippingAddress.phone
      }

      // If still no phone, try to get it from user's address
      if (!phone) {
        // Try to get phone from user's default address first
        let userAddress = await this.prisma.address.findFirst({
          where: { userId, default: true },
          select: { phone: true },
        })

        // If no default address, get phone from any address
        if (!userAddress) {
          userAddress = await this.prisma.address.findFirst({
            where: { userId },
            select: { phone: true },
          })
        }

        if (userAddress?.phone) {
          phone = userAddress.phone
        }
      }

      // Validate required fields
      if (!phone) {
        return {
          status: "error",
          message: "Phone number is required. Please add an address with a valid phone number.",
          data: null,
        }
      }

      if (!email) {
        return {
          status: "error",
          message: "Email is required for payment processing.",
          data: null,
        }
      }

      if (!name) {
        return {
          status: "error",
          message: "Name is required for payment processing.",
          data: null,
        }
      }

      // Create Cashfree payment session using the created order ID
      const paymentSession = await this.paymentsService.createCashfreeOrder(
        createPaymentDto.orderTotal,
        createdOrder.id,
        userId,
        {
          email,
          phone,
          name,
        },
      )

      // Create payment record immediately with the Cashfree order ID
      const paymentRecord = await this.paymentsService.createPaymentRecord(
        createdOrder.id,
        userId,
        createPaymentDto.orderTotal,
        paymentSession.order_id, // This is the Cashfree order ID
        paymentSession.payment_session_id,
      )

      return {
        status: "success",
        message: "Order created and payment session initialized successfully",
        data: {
          order: {
            id: createdOrder.id,
            orderId: createdOrder.orderId,
            status: createdOrder.status,
            orderTotal: createdOrder.orderTotal,
          },
          paymentSession,
          paymentId: paymentRecord.id,
        },
      }
    } catch (error) {
      return {
        status: "error",
        message: error.message || "Failed to create order and payment session",
        data: null,
      }
    }
  }

  @Get("verify/:orderId")
  async verifyPayment(@Param('orderId') orderId: string) {
    try {
      const paymentData = await this.paymentsService.getPaymentStatusByOrderId(orderId)
      return {
        status: "success",
        message: "Payment status retrieved successfully",
        data: paymentData,
      }
    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      }
    }
  }

  @Get("verify-by-cashfree/:cashfreeOrderId")
  async verifyPaymentByCashfreeId(cashfreeOrderId: string) {
    try {
      const paymentData = await this.paymentsService.getPaymentByCashfreeOrderId(cashfreeOrderId)
      return {
        status: "success",
        message: "Payment status retrieved successfully",
        data: paymentData,
      }
    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      }
    }
  }

  @Post("webhook")
  async handleWebhook(@Body() webhookData: any) {
    try {
      const result = await this.paymentsService.handleWebhook(webhookData)
      return result
    } catch (error) {
      return {
        status: "error",
        message: error.message,
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post("retry")
  async retryPayment(@Body() retryPaymentDto: RetryPaymentDto, @Req() req) {
    try {
      const { id: userId } = req.user
      const result = await this.paymentsService.retryPayment(retryPaymentDto.orderId, userId)

      return {
        status: "success",
        message: "New order created successfully for payment retry.",
        data: result,
      }
    } catch (error) {
      return {
        status: "error",
        message: error.message || "Failed to create new order for payment retry.",
        data: null,
      }
    }
  }

  @Get("admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAllPayments(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("search") search?: string,
    @Query("status") status?: PaymentStatus,
    @Query("fromDate") fromDate?: string,
    @Query("toDate") toDate?: string,
  ) {
    try {
      const result = await this.paymentsService.getAllPayments(
        Number(page),
        Number(limit),
        search,
        status,
        fromDate,
        toDate,
      )
      return {
        status: "success",
        message: "Payments retrieved successfully",
        data: result,
      }
    } catch (error) {
      return {
        status: "error",
        message: error.message || "Failed to retrieve payments",
        data: null,
      }
    }
  }

  @Get("admin/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getPaymentDetails(@Param("id") id: string) {
    try {
      const result = await this.paymentsService.getPaymentDetails(id)
      return {
        status: "success",
        message: "Payment details retrieved successfully",
        data: result,
      }
    } catch (error) {
      return {
        status: "error",
        message: error.message || "Failed to retrieve payment details",
        data: null,
      }
    }
  }
}
