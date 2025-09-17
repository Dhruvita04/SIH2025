import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { PrismaService } from "src/prisma/prisma.service"
import { PaymentGateway, PaymentMethod, PaymentStatus, OrderStatus, type Prisma } from "@prisma/client"
import axios from "axios"
import { OrdersService } from "src/orders/orders.service"

interface CustomerDetails {
  email: string
  phone: string
  name: string
}

@Injectable()
export class PaymentsService {
  private readonly apiBaseUrl: string
  private readonly appId: string
  private readonly secretKey: string
  private readonly apiVersion: string

  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
  ) {
    // Read ALL configuration from environment variables
    this.apiBaseUrl = process.env.CASHFREE_API_URL
    this.appId = process.env.CASHFREE_APP_ID
    this.secretKey = process.env.CASHFREE_SECRET_KEY
    this.apiVersion = process.env.CASHFREE_API_VERSION || "2023-08-01"

    // Validate all required environment variables
    if (!this.apiBaseUrl || !this.appId || !this.secretKey) {
      throw new InternalServerErrorException(
        "Cashfree environment variables (CASHFREE_API_URL, CASHFREE_APP_ID, CASHFREE_SECRET_KEY) must be configured.",
      )
    }
  }

  private getAuthHeaders() {
    return {
      accept: "application/json",
      "x-client-id": this.appId,
      "x-client-secret": this.secretKey,
      "x-api-version": this.apiVersion,
      "content-type": "application/json",
    }
  }

  async createCashfreeOrder(amount: number, temporaryOrderId: string, userId: string, customer: CustomerDetails) {
    try {
      // Generate a unique Cashfree order ID (this will be used for Cashfree API)
      // Use a shorter format to stay under 50 character limit
      const timestamp = Date.now().toString().slice(-8) // Last 8 digits of timestamp
      const shortOrderId = temporaryOrderId.replace(/-/g, "").slice(0, 20) // Remove hyphens and take first 20 chars
      const cashfreeOrderId = `cf_${shortOrderId}_${timestamp}`

      const payload = {
        order_id: cashfreeOrderId, // Use unique Cashfree order ID
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: userId,
          customer_email: customer.email,
          customer_phone: customer.phone,
          customer_name: customer.name,
        },
        order_meta: {
          return_url: `${process.env.FRONTEND_URL}/order-status/${temporaryOrderId}`, // Use original order ID for return URL
        },
        order_note: `Order #${temporaryOrderId}`,
      }

      const response = await axios.post(`${this.apiBaseUrl}/orders`, payload, {
        headers: this.getAuthHeaders(),
      })

      // Correct response structure from Cashfree
      if (!response.data || !response.data.payment_session_id) {
        throw new BadRequestException("Invalid response from Cashfree API")
      }

      const { payment_session_id } = response.data

      // Return the correct order_id that we generated and sent
      return {
        payment_session_id,
        order_id: cashfreeOrderId,
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }

      throw new BadRequestException(
        `Failed to create Cashfree order: ${error.response?.data?.message || error.message}`,
      )
    }
  }

  async createPaymentRecord(
    orderId: string,
    userId: string,
    amount: number,
    gatewayOrderId: string,
    paymentSessionId: string,
  ) {
    try {
      return await this.prisma.payment.create({
        data: {
          orderId,
          userId,
          amount,
          gateway: PaymentGateway.CASHFREE,
          status: PaymentStatus.PENDING, // Always start with PENDING status
          method: PaymentMethod.UPI, // Default, will be updated via webhook
          gatewayOrderId,
          paymentSessionId,
          currency: "INR",
        },
      })
    } catch (error) {
      throw new BadRequestException(`Failed to create payment record: ${error.message}`)
    }
  }

  async createOrUpdatePaymentRecord(
    orderId: string,
    userId: string,
    amount: number,
    gatewayOrderId: string,
    paymentSessionId: string,
  ) {
    try {
      // Use upsert to handle both create and update scenarios
      return await this.prisma.payment.upsert({
        where: { orderId },
        update: {
          amount,
          gateway: PaymentGateway.CASHFREE,
          status: PaymentStatus.PENDING,
          method: PaymentMethod.UPI,
          gatewayOrderId,
          paymentSessionId,
          currency: "INR",
          updatedAt: new Date(),
          // Reset these fields for retry
          transactionId: null,
          gatewayReferenceId: null,
          paymentDate: null,
          confirmationDate: null,
          errorMessage: null,
        },
        create: {
          orderId,
          userId,
          amount,
          gateway: PaymentGateway.CASHFREE,
          status: PaymentStatus.PENDING,
          method: PaymentMethod.UPI,
          gatewayOrderId,
          paymentSessionId,
          currency: "INR",
        },
      })
    } catch (error) {
      throw new BadRequestException(`Failed to create or update payment record: ${error.message}`)
    }
  }

  async verifyPayment(orderId: string) {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/orders/${orderId}/payments`, {
        headers: this.getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      throw new BadRequestException(`Failed to verify payment: ${error.response?.data?.message || error.message}`)
    }
  }

  async getOrderDetails(orderId: string) {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/orders/${orderId}`, {
        headers: this.getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      throw new BadRequestException(`Failed to get order details: ${error.response?.data?.message || error.message}`)
    }
  }

  async getPaymentStatusByOrderId(orderId: string) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { orderId },
      })

      if (!payment) {
        const order = await this.prisma.order.findUnique({
          where: { id: orderId },
          select: { userId: true, orderId: true },
        })
        if (order) {
        }
        throw new BadRequestException("Payment record not found for this order")
      }

      // If status is PENDING or FAILED, actively verify with Cashfree
      if (payment.status === PaymentStatus.PENDING || payment.status === PaymentStatus.FAILED) {
        try {
          const cashfreePayments = await this.verifyPayment(payment.gatewayOrderId)

          if (cashfreePayments && cashfreePayments.length > 0) {
            // Find the most relevant payment status. A successful payment takes precedence.
            const successfulPayment = cashfreePayments.find((p: any) => p.payment_status === "SUCCESS")
            const failedPayment = cashfreePayments.find(
              (p: any) => p.payment_status === "FAILED" || p.payment_status === "USER_DROPPED",
            )

            if (successfulPayment) {
              await this._processCashfreePaymentData(payment.gatewayOrderId, successfulPayment)
            } else if (failedPayment) {
              await this._processCashfreePaymentData(payment.gatewayOrderId, failedPayment)
            }
          }
        } catch (error) {
          // Do not fail the request. Return the current status from DB.
        }
      }

      // Fetch the latest payment record from DB after potential update
      const finalPayment = await this.prisma.payment.findUnique({
        where: { orderId },
        include: {
          order: {
            select: {
              id: true,
              orderId: true,
              status: true,
              orderTotal: true,
            },
          },
        },
      })

      if (!finalPayment) {
        throw new InternalServerErrorException("Payment record disappeared after verification. This should not happen.")
      }

      return {
        paymentId: finalPayment.id,
        orderId: finalPayment.orderId,
        status: finalPayment.status,
        method: finalPayment.method,
        amount: finalPayment.amount,
        gatewayOrderId: finalPayment.gatewayOrderId,
        transactionId: finalPayment.transactionId,
        paymentDate: finalPayment.paymentDate,
        order: finalPayment.order,
      }
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error
      }
      throw new InternalServerErrorException(`Failed to get payment status: ${error.message}`)
    }
  }

  async handleWebhook(webhookData: any) {
    try {
      const { data } = webhookData

      if (!data || !data.order || !data.payment) {
        throw new BadRequestException("Invalid webhook payload structure")
      }

      const gatewayOrderId = data.order.order_id
      const paymentData = data.payment

      await this._processCashfreePaymentData(gatewayOrderId, paymentData)

      return { status: "ok" }
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error
      }
      // For other internal errors, return 'ok' to prevent Cashfree from retrying indefinitely.
      return { status: "ok", message: "Internal error processing webhook." }
    }
  }

  async getPaymentByCashfreeOrderId(cashfreeOrderId: string) {
    try {
      const payment = await this.prisma.payment.findFirst({
        where: { gatewayOrderId: cashfreeOrderId },
      })

      if (!payment) {
        throw new BadRequestException("Payment record not found for this Cashfree order ID")
      }

      // If status is PENDING, actively verify with Cashfree
      if (payment.status === PaymentStatus.PENDING) {
        try {
          const cashfreePayments = await this.verifyPayment(payment.gatewayOrderId)

          if (cashfreePayments && cashfreePayments.length > 0) {
            const successfulPayment = cashfreePayments.find((p: any) => p.payment_status === "SUCCESS")
            const failedPayment = cashfreePayments.find(
              (p: any) => p.payment_status === "FAILED" || p.payment_status === "USER_DROPPED",
            )

            if (successfulPayment) {
              await this._processCashfreePaymentData(payment.gatewayOrderId, successfulPayment)
            } else if (failedPayment) {
              await this._processCashfreePaymentData(payment.gatewayOrderId, failedPayment)
            }
          }
        } catch (error) {}
      }

      // Fetch the latest payment record from DB after potential update
      const finalPayment = await this.prisma.payment.findFirst({
        where: { gatewayOrderId: cashfreeOrderId },
        include: {
          order: {
            select: {
              id: true,
              orderId: true,
              status: true,
              orderTotal: true,
            },
          },
        },
      })

      if (!finalPayment) {
        throw new InternalServerErrorException("Payment record disappeared after verification.")
      }

      return {
        paymentId: finalPayment.id,
        orderId: finalPayment.orderId,
        status: finalPayment.status,
        method: finalPayment.method,
        amount: finalPayment.amount,
        gatewayOrderId: finalPayment.gatewayOrderId,
        transactionId: finalPayment.transactionId,
        paymentDate: finalPayment.paymentDate,
        order: finalPayment.order,
      }
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error
      }
      throw new InternalServerErrorException(`Failed to get payment status: ${error.message}`)
    }
  }

  private async _processCashfreePaymentData(gatewayOrderId: string, paymentData: any) {
    try {
      const paymentStatus = paymentData.payment_status
      const cfPaymentId = paymentData.cf_payment_id
      const paymentMethod = paymentData.payment_method
      const paymentTime = paymentData.payment_time

      if (!gatewayOrderId) {
        throw new BadRequestException("Gateway Order ID is missing in payment data.")
      }

      let mappedStatus: PaymentStatus
      let mappedMethod: PaymentMethod = PaymentMethod.UPI // Default

      switch (paymentStatus) {
        case "SUCCESS":
          mappedStatus = PaymentStatus.COMPLETED
          break
        case "NOT_ATTEMPTED":
        case "PENDING":
          mappedStatus = PaymentStatus.PENDING
          break
        case "FAILED":
        case "USER_DROPPED":
        case "VOID":
        case "CANCELLED":
        case "AUTHORIZATION_FAILED":
          mappedStatus = PaymentStatus.FAILED
          break
        default:
          mappedStatus = PaymentStatus.PENDING
      }

      if (paymentMethod) {
        if (paymentMethod.upi) mappedMethod = PaymentMethod.UPI
        else if (paymentMethod.card) {
          mappedMethod =
            paymentMethod.card.card_type === "credit_card" ? PaymentMethod.CREDIT_CARD : PaymentMethod.DEBIT_CARD
        } else if (paymentMethod.netbanking) {
          mappedMethod = PaymentMethod.NET_BANKING
        }
      }

      const existingPayment = await this.prisma.payment.findFirst({
        where: { gatewayOrderId },
        select: { id: true, orderId: true, status: true },
      })

      if (!existingPayment) {
        throw new NotFoundException(`No payment record found for gateway order ID: ${gatewayOrderId}`)
      }

      if (existingPayment.status === mappedStatus || existingPayment.status === PaymentStatus.COMPLETED) {
        return
      }

      const updateResult = await this.prisma.payment.updateMany({
        where: { gatewayOrderId },
        data: {
          status: mappedStatus,
          transactionId: cfPaymentId?.toString(),
          gatewayReferenceId: cfPaymentId?.toString(),
          method: mappedMethod,
          paymentDate: paymentTime ? new Date(paymentTime) : new Date(),
          confirmationDate: mappedStatus === PaymentStatus.COMPLETED ? new Date() : undefined,
          errorMessage: paymentData.payment_message,
          updatedAt: new Date(),
        },
      })

      if (existingPayment.orderId) {
        await this.ordersService.updateOrderStatusByPayment(existingPayment.orderId, mappedStatus)
      }
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error
      }
      // Do not re-throw other errors to avoid breaking the parent flow (like verification)
    }
  }

  async retryPayment(orderId: string, userId: string) {
    // 1. Get repayment window from env, default to 30 minutes
    const repaymentWindowMinutes = Number.parseInt(process.env.REPAYMENT_WINDOW_MINUTES || "30", 10)

    // 2. Find the original order and its related data
    const originalOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, email: true, name: true, phone: true } },
        shippingAddress: true,
        products: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    })

    // 3. Validations
    if (!originalOrder) {
      throw new NotFoundException("Order not found.")
    }

    if (originalOrder.userId !== userId) {
      throw new BadRequestException("You are not authorized to retry payment for this order.")
    }

    if (originalOrder.status !== OrderStatus.PAYMENT_FAILED) {
      throw new BadRequestException(
        `Payment can only be retried for failed orders. Current status: ${originalOrder.status}`,
      )
    }

    const orderCreationTime = new Date(originalOrder.createdAt)
    const now = new Date()
    const minutesSinceCreation = (now.getTime() - orderCreationTime.getTime()) / (1000 * 60)

    if (minutesSinceCreation > repaymentWindowMinutes) {
      throw new BadRequestException(`The repayment window of ${repaymentWindowMinutes} minutes has expired.`)
    }

    // 4. Get customer details
    const customer = {
      email: originalOrder.user.email,
      name: originalOrder.user.name,
      phone: originalOrder.user.phone || originalOrder.shippingAddress.phone,
    }

    if (!customer.phone || !customer.email || !customer.name) {
      throw new BadRequestException("Customer details (name, email, phone) are required to retry payment.")
    }

    // 5. Create a new Cashfree payment session for the EXISTING order (no order changes)
    const newPaymentSession = await this.createCashfreeOrder(
      originalOrder.orderTotal,
      originalOrder.id, // Use existing order ID
      userId,
      customer,
    )

    // 6. Return only the payment session details without affecting any orders
    return {
      orderId: originalOrder.id,
      orderNumber: originalOrder.orderId,
      paymentSession: newPaymentSession,
      message: "Payment session created successfully. Original order unchanged.",
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

  async getAllPayments(
    page: number,
    limit: number,
    search?: string,
    status?: PaymentStatus,
    fromDate?: string,
    toDate?: string,
  ) {
    const skip = (page - 1) * limit

    const where: Prisma.PaymentWhereInput = {}

    if (search) {
      const orConditions: Prisma.PaymentWhereInput[] = [
        { id: { contains: search, mode: "insensitive" } },
        { gatewayOrderId: { contains: search, mode: "insensitive" } },
        { transactionId: { contains: search, mode: "insensitive" } },
        { order: { orderId: { contains: search, mode: "insensitive" } } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { phone: { contains: search, mode: "insensitive" } } },
      ]

      // Check if search term is a number for amount matching
      const searchAsInt = Number.parseInt(search, 10)
      if (!isNaN(searchAsInt)) {
        orConditions.push({ amount: searchAsInt })
      }

      // Check if search term matches a PaymentStatus enum
      const searchUpper = search.toUpperCase()
      if (Object.values(PaymentStatus).includes(searchUpper as PaymentStatus)) {
        orConditions.push({ status: searchUpper as PaymentStatus })
      }

      // Check if search term matches a PaymentMethod enum
      if (Object.values(PaymentMethod).includes(searchUpper as PaymentMethod)) {
        orConditions.push({ method: searchUpper as PaymentMethod })
      }

      where.OR = orConditions
    }

    if (status && Object.values(PaymentStatus).includes(status)) {
      where.status = status
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

    const [payments, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
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
            },
          },
          order: {
            select: {
              id: true,
              orderId: true,
              status: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ])

    return {
      data: this.formatDatesInObject(payments),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getPaymentDetails(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        order: {
          include: {
            shippingAddress: true,
            products: {
              include: {
                product: {
                  select: { name: true, images: true },
                },
                variant: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    })

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found.`)
    }

    // Build detailed Cashfree dashboard URL
    let cashfreeDashboardUrl = null
    if (payment.gatewayOrderId) {
      const baseUrl =
        process.env.CASHFREE_DASHBOARD_BASE_URL ||
        "https://merchant.cashfree.com/merchants/pg/transactions/orders/orders-description"
      const environment = process.env.CASHFREE_ENVIRONMENT || "test" // or "prod"

      // Get payment date in IST (Indian Standard Time)
      const paymentDate = new Date(payment.createdAt)

      // Format the payment date for orderAddedon parameter (with comma and uppercase AM/PM)
      const orderAddedOn = paymentDate
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata", // IST timezone
        })
        // Keep the comma and ensure uppercase AM/PM
        .replace(/am/gi, "AM")
        .replace(/pm/gi, "PM")

      // Create full-day window: 00:00:00 to 23:59:59 of the same day in IST
      const istPaymentDate = new Date(paymentDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))

      // Start date: Beginning of the day (00:00:00)
      const startDate = new Date(istPaymentDate)
      startDate.setHours(0, 0, 0, 0)

      // End date: End of the day (23:59:59)
      const endDate = new Date(istPaymentDate)
      endDate.setHours(23, 59, 59, 999)

      // Format dates for URL parameters (YYYY-MM-DD HH:mm:ss format)
      const formatDateForUrl = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        const hours = String(date.getHours()).padStart(2, "0")
        const minutes = String(date.getMinutes()).padStart(2, "0")
        const seconds = String(date.getSeconds()).padStart(2, "0")

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      }

      const urlParams = new URLSearchParams({
        orderId: payment.gatewayOrderId,
        orderAddedon: orderAddedOn,
        startDate: formatDateForUrl(startDate),
        endDate: formatDateForUrl(endDate),
        pageSize: "10",
        pageNo: "0",
        env: environment,
      })

      cashfreeDashboardUrl = `${baseUrl}?${urlParams.toString()}`
    }

    return this.formatDatesInObject({
      ...payment,
      cashfreeDashboardUrl,
    })
  }
}
