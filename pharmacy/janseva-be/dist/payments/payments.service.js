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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const axios_1 = require("axios");
const orders_service_1 = require("../orders/orders.service");
let PaymentsService = class PaymentsService {
    constructor(prisma, ordersService) {
        this.prisma = prisma;
        this.ordersService = ordersService;
        this.apiBaseUrl = process.env.CASHFREE_API_URL;
        this.appId = process.env.CASHFREE_APP_ID;
        this.secretKey = process.env.CASHFREE_SECRET_KEY;
        this.apiVersion = process.env.CASHFREE_API_VERSION || "2023-08-01";
        if (!this.apiBaseUrl || !this.appId || !this.secretKey) {
            throw new common_1.InternalServerErrorException("Cashfree environment variables (CASHFREE_API_URL, CASHFREE_APP_ID, CASHFREE_SECRET_KEY) must be configured.");
        }
    }
    getAuthHeaders() {
        return {
            accept: "application/json",
            "x-client-id": this.appId,
            "x-client-secret": this.secretKey,
            "x-api-version": this.apiVersion,
            "content-type": "application/json",
        };
    }
    async createCashfreeOrder(amount, temporaryOrderId, userId, customer) {
        try {
            const timestamp = Date.now().toString().slice(-8);
            const shortOrderId = temporaryOrderId.replace(/-/g, "").slice(0, 20);
            const cashfreeOrderId = `cf_${shortOrderId}_${timestamp}`;
            const payload = {
                order_id: cashfreeOrderId,
                order_amount: amount,
                order_currency: "INR",
                customer_details: {
                    customer_id: userId,
                    customer_email: customer.email,
                    customer_phone: customer.phone,
                    customer_name: customer.name,
                },
                order_meta: {
                    return_url: `${process.env.FRONTEND_URL}/order-status/${temporaryOrderId}`,
                },
                order_note: `Order #${temporaryOrderId}`,
            };
            const response = await axios_1.default.post(`${this.apiBaseUrl}/orders`, payload, {
                headers: this.getAuthHeaders(),
            });
            if (!response.data || !response.data.payment_session_id) {
                throw new common_1.BadRequestException("Invalid response from Cashfree API");
            }
            const { payment_session_id } = response.data;
            return {
                payment_session_id,
                order_id: cashfreeOrderId,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to create Cashfree order: ${error.response?.data?.message || error.message}`);
        }
    }
    async createPaymentRecord(orderId, userId, amount, gatewayOrderId, paymentSessionId) {
        try {
            return await this.prisma.payment.create({
                data: {
                    orderId,
                    userId,
                    amount,
                    gateway: client_1.PaymentGateway.CASHFREE,
                    status: client_1.PaymentStatus.PENDING,
                    method: client_1.PaymentMethod.UPI,
                    gatewayOrderId,
                    paymentSessionId,
                    currency: "INR",
                },
            });
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to create payment record: ${error.message}`);
        }
    }
    async createOrUpdatePaymentRecord(orderId, userId, amount, gatewayOrderId, paymentSessionId) {
        try {
            return await this.prisma.payment.upsert({
                where: { orderId },
                update: {
                    amount,
                    gateway: client_1.PaymentGateway.CASHFREE,
                    status: client_1.PaymentStatus.PENDING,
                    method: client_1.PaymentMethod.UPI,
                    gatewayOrderId,
                    paymentSessionId,
                    currency: "INR",
                    updatedAt: new Date(),
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
                    gateway: client_1.PaymentGateway.CASHFREE,
                    status: client_1.PaymentStatus.PENDING,
                    method: client_1.PaymentMethod.UPI,
                    gatewayOrderId,
                    paymentSessionId,
                    currency: "INR",
                },
            });
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to create or update payment record: ${error.message}`);
        }
    }
    async verifyPayment(orderId) {
        try {
            const response = await axios_1.default.get(`${this.apiBaseUrl}/orders/${orderId}/payments`, {
                headers: this.getAuthHeaders(),
            });
            return response.data;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to verify payment: ${error.response?.data?.message || error.message}`);
        }
    }
    async getOrderDetails(orderId) {
        try {
            const response = await axios_1.default.get(`${this.apiBaseUrl}/orders/${orderId}`, {
                headers: this.getAuthHeaders(),
            });
            return response.data;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to get order details: ${error.response?.data?.message || error.message}`);
        }
    }
    async getPaymentStatusByOrderId(orderId) {
        try {
            const payment = await this.prisma.payment.findUnique({
                where: { orderId },
            });
            if (!payment) {
                const order = await this.prisma.order.findUnique({
                    where: { id: orderId },
                    select: { userId: true, orderId: true },
                });
                if (order) {
                }
                throw new common_1.BadRequestException("Payment record not found for this order");
            }
            if (payment.status === client_1.PaymentStatus.PENDING || payment.status === client_1.PaymentStatus.FAILED) {
                try {
                    const cashfreePayments = await this.verifyPayment(payment.gatewayOrderId);
                    if (cashfreePayments && cashfreePayments.length > 0) {
                        const successfulPayment = cashfreePayments.find((p) => p.payment_status === "SUCCESS");
                        const failedPayment = cashfreePayments.find((p) => p.payment_status === "FAILED" || p.payment_status === "USER_DROPPED");
                        if (successfulPayment) {
                            await this._processCashfreePaymentData(payment.gatewayOrderId, successfulPayment);
                        }
                        else if (failedPayment) {
                            await this._processCashfreePaymentData(payment.gatewayOrderId, failedPayment);
                        }
                    }
                }
                catch (error) {
                }
            }
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
            });
            if (!finalPayment) {
                throw new common_1.InternalServerErrorException("Payment record disappeared after verification. This should not happen.");
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
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(`Failed to get payment status: ${error.message}`);
        }
    }
    async handleWebhook(webhookData) {
        try {
            const { data } = webhookData;
            if (!data || !data.order || !data.payment) {
                throw new common_1.BadRequestException("Invalid webhook payload structure");
            }
            const gatewayOrderId = data.order.order_id;
            const paymentData = data.payment;
            await this._processCashfreePaymentData(gatewayOrderId, paymentData);
            return { status: "ok" };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            return { status: "ok", message: "Internal error processing webhook." };
        }
    }
    async getPaymentByCashfreeOrderId(cashfreeOrderId) {
        try {
            const payment = await this.prisma.payment.findFirst({
                where: { gatewayOrderId: cashfreeOrderId },
            });
            if (!payment) {
                throw new common_1.BadRequestException("Payment record not found for this Cashfree order ID");
            }
            if (payment.status === client_1.PaymentStatus.PENDING) {
                try {
                    const cashfreePayments = await this.verifyPayment(payment.gatewayOrderId);
                    if (cashfreePayments && cashfreePayments.length > 0) {
                        const successfulPayment = cashfreePayments.find((p) => p.payment_status === "SUCCESS");
                        const failedPayment = cashfreePayments.find((p) => p.payment_status === "FAILED" || p.payment_status === "USER_DROPPED");
                        if (successfulPayment) {
                            await this._processCashfreePaymentData(payment.gatewayOrderId, successfulPayment);
                        }
                        else if (failedPayment) {
                            await this._processCashfreePaymentData(payment.gatewayOrderId, failedPayment);
                        }
                    }
                }
                catch (error) { }
            }
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
            });
            if (!finalPayment) {
                throw new common_1.InternalServerErrorException("Payment record disappeared after verification.");
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
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(`Failed to get payment status: ${error.message}`);
        }
    }
    async _processCashfreePaymentData(gatewayOrderId, paymentData) {
        try {
            const paymentStatus = paymentData.payment_status;
            const cfPaymentId = paymentData.cf_payment_id;
            const paymentMethod = paymentData.payment_method;
            const paymentTime = paymentData.payment_time;
            if (!gatewayOrderId) {
                throw new common_1.BadRequestException("Gateway Order ID is missing in payment data.");
            }
            let mappedStatus;
            let mappedMethod = client_1.PaymentMethod.UPI;
            switch (paymentStatus) {
                case "SUCCESS":
                    mappedStatus = client_1.PaymentStatus.COMPLETED;
                    break;
                case "NOT_ATTEMPTED":
                case "PENDING":
                    mappedStatus = client_1.PaymentStatus.PENDING;
                    break;
                case "FAILED":
                case "USER_DROPPED":
                case "VOID":
                case "CANCELLED":
                case "AUTHORIZATION_FAILED":
                    mappedStatus = client_1.PaymentStatus.FAILED;
                    break;
                default:
                    mappedStatus = client_1.PaymentStatus.PENDING;
            }
            if (paymentMethod) {
                if (paymentMethod.upi)
                    mappedMethod = client_1.PaymentMethod.UPI;
                else if (paymentMethod.card) {
                    mappedMethod =
                        paymentMethod.card.card_type === "credit_card" ? client_1.PaymentMethod.CREDIT_CARD : client_1.PaymentMethod.DEBIT_CARD;
                }
                else if (paymentMethod.netbanking) {
                    mappedMethod = client_1.PaymentMethod.NET_BANKING;
                }
            }
            const existingPayment = await this.prisma.payment.findFirst({
                where: { gatewayOrderId },
                select: { id: true, orderId: true, status: true },
            });
            if (!existingPayment) {
                throw new common_1.NotFoundException(`No payment record found for gateway order ID: ${gatewayOrderId}`);
            }
            if (existingPayment.status === mappedStatus || existingPayment.status === client_1.PaymentStatus.COMPLETED) {
                return;
            }
            const updateResult = await this.prisma.payment.updateMany({
                where: { gatewayOrderId },
                data: {
                    status: mappedStatus,
                    transactionId: cfPaymentId?.toString(),
                    gatewayReferenceId: cfPaymentId?.toString(),
                    method: mappedMethod,
                    paymentDate: paymentTime ? new Date(paymentTime) : new Date(),
                    confirmationDate: mappedStatus === client_1.PaymentStatus.COMPLETED ? new Date() : undefined,
                    errorMessage: paymentData.payment_message,
                    updatedAt: new Date(),
                },
            });
            if (existingPayment.orderId) {
                await this.ordersService.updateOrderStatusByPayment(existingPayment.orderId, mappedStatus);
            }
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
        }
    }
    async retryPayment(orderId, userId) {
        const repaymentWindowMinutes = Number.parseInt(process.env.REPAYMENT_WINDOW_MINUTES || "30", 10);
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
        });
        if (!originalOrder) {
            throw new common_1.NotFoundException("Order not found.");
        }
        if (originalOrder.userId !== userId) {
            throw new common_1.BadRequestException("You are not authorized to retry payment for this order.");
        }
        if (originalOrder.status !== client_1.OrderStatus.PAYMENT_FAILED) {
            throw new common_1.BadRequestException(`Payment can only be retried for failed orders. Current status: ${originalOrder.status}`);
        }
        const orderCreationTime = new Date(originalOrder.createdAt);
        const now = new Date();
        const minutesSinceCreation = (now.getTime() - orderCreationTime.getTime()) / (1000 * 60);
        if (minutesSinceCreation > repaymentWindowMinutes) {
            throw new common_1.BadRequestException(`The repayment window of ${repaymentWindowMinutes} minutes has expired.`);
        }
        const customer = {
            email: originalOrder.user.email,
            name: originalOrder.user.name,
            phone: originalOrder.user.phone || originalOrder.shippingAddress.phone,
        };
        if (!customer.phone || !customer.email || !customer.name) {
            throw new common_1.BadRequestException("Customer details (name, email, phone) are required to retry payment.");
        }
        const newPaymentSession = await this.createCashfreeOrder(originalOrder.orderTotal, originalOrder.id, userId, customer);
        return {
            orderId: originalOrder.id,
            orderNumber: originalOrder.orderId,
            paymentSession: newPaymentSession,
            message: "Payment session created successfully. Original order unchanged.",
        };
    }
    formatDatesInObject(obj) {
        if (obj === null || obj === undefined) {
            return obj;
        }
        if (obj instanceof Date) {
            return obj.toISOString();
        }
        if (Array.isArray(obj)) {
            return obj.map((item) => this.formatDatesInObject(item));
        }
        if (typeof obj === "object") {
            const newObj = {};
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    newObj[key] = this.formatDatesInObject(obj[key]);
                }
            }
            return newObj;
        }
        return obj;
    }
    async getAllPayments(page, limit, search, status, fromDate, toDate) {
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            const orConditions = [
                { id: { contains: search, mode: "insensitive" } },
                { gatewayOrderId: { contains: search, mode: "insensitive" } },
                { transactionId: { contains: search, mode: "insensitive" } },
                { order: { orderId: { contains: search, mode: "insensitive" } } },
                { user: { name: { contains: search, mode: "insensitive" } } },
                { user: { email: { contains: search, mode: "insensitive" } } },
                { user: { phone: { contains: search, mode: "insensitive" } } },
            ];
            const searchAsInt = Number.parseInt(search, 10);
            if (!isNaN(searchAsInt)) {
                orConditions.push({ amount: searchAsInt });
            }
            const searchUpper = search.toUpperCase();
            if (Object.values(client_1.PaymentStatus).includes(searchUpper)) {
                orConditions.push({ status: searchUpper });
            }
            if (Object.values(client_1.PaymentMethod).includes(searchUpper)) {
                orConditions.push({ method: searchUpper });
            }
            where.OR = orConditions;
        }
        if (status && Object.values(client_1.PaymentStatus).includes(status)) {
            where.status = status;
        }
        const dateFilter = {};
        if (fromDate) {
            const startDate = new Date(fromDate);
            startDate.setUTCHours(0, 0, 0, 0);
            dateFilter.gte = startDate;
        }
        if (toDate) {
            const endDate = new Date(toDate);
            endDate.setUTCHours(23, 59, 59, 999);
            dateFilter.lte = endDate;
        }
        if (Object.keys(dateFilter).length > 0) {
            where.createdAt = dateFilter;
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
        ]);
        return {
            data: this.formatDatesInObject(payments),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getPaymentDetails(paymentId) {
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
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${paymentId} not found.`);
        }
        let cashfreeDashboardUrl = null;
        if (payment.gatewayOrderId) {
            const baseUrl = process.env.CASHFREE_DASHBOARD_BASE_URL ||
                "https://merchant.cashfree.com/merchants/pg/transactions/orders/orders-description";
            const environment = process.env.CASHFREE_ENVIRONMENT || "test";
            const paymentDate = new Date(payment.createdAt);
            const orderAddedOn = paymentDate
                .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                timeZone: "Asia/Kolkata",
            })
                .replace(/am/gi, "AM")
                .replace(/pm/gi, "PM");
            const istPaymentDate = new Date(paymentDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            const startDate = new Date(istPaymentDate);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(istPaymentDate);
            endDate.setHours(23, 59, 59, 999);
            const formatDateForUrl = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                const hours = String(date.getHours()).padStart(2, "0");
                const minutes = String(date.getMinutes()).padStart(2, "0");
                const seconds = String(date.getSeconds()).padStart(2, "0");
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            };
            const urlParams = new URLSearchParams({
                orderId: payment.gatewayOrderId,
                orderAddedon: orderAddedOn,
                startDate: formatDateForUrl(startDate),
                endDate: formatDateForUrl(endDate),
                pageSize: "10",
                pageNo: "0",
                env: environment,
            });
            cashfreeDashboardUrl = `${baseUrl}?${urlParams.toString()}`;
        }
        return this.formatDatesInObject({
            ...payment,
            cashfreeDashboardUrl,
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        orders_service_1.OrdersService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map