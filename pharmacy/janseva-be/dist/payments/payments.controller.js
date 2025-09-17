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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const payments_service_1 = require("./payments.service");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const prisma_service_1 = require("../prisma/prisma.service");
const orders_service_1 = require("../orders/orders.service");
const retry_payment_dto_1 = require("./dto/retry-payment.dto");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let PaymentsController = class PaymentsController {
    constructor(paymentsService, prisma, ordersService) {
        this.paymentsService = paymentsService;
        this.prisma = prisma;
        this.ordersService = ordersService;
    }
    async createCashfreeOrder(req, createPaymentDto) {
        try {
            const { id: userId, email, name } = req.user;
            let { phone } = req.user;
            const orderData = {
                userId,
                addressId: createPaymentDto.addressId,
                couponId: createPaymentDto.couponId,
                prescriptionId: createPaymentDto.prescriptionId,
                subTotal: createPaymentDto.subTotal,
                discount: createPaymentDto.discount,
                shipping: createPaymentDto.shipping,
                orderTotal: createPaymentDto.orderTotal,
                items: createPaymentDto.items,
            };
            const createdOrder = await this.ordersService.createOrder(orderData);
            if (!phone && createdOrder.shippingAddress?.phone) {
                phone = createdOrder.shippingAddress.phone;
            }
            if (!phone) {
                let userAddress = await this.prisma.address.findFirst({
                    where: { userId, default: true },
                    select: { phone: true },
                });
                if (!userAddress) {
                    userAddress = await this.prisma.address.findFirst({
                        where: { userId },
                        select: { phone: true },
                    });
                }
                if (userAddress?.phone) {
                    phone = userAddress.phone;
                }
            }
            if (!phone) {
                return {
                    status: "error",
                    message: "Phone number is required. Please add an address with a valid phone number.",
                    data: null,
                };
            }
            if (!email) {
                return {
                    status: "error",
                    message: "Email is required for payment processing.",
                    data: null,
                };
            }
            if (!name) {
                return {
                    status: "error",
                    message: "Name is required for payment processing.",
                    data: null,
                };
            }
            const paymentSession = await this.paymentsService.createCashfreeOrder(createPaymentDto.orderTotal, createdOrder.id, userId, {
                email,
                phone,
                name,
            });
            const paymentRecord = await this.paymentsService.createPaymentRecord(createdOrder.id, userId, createPaymentDto.orderTotal, paymentSession.order_id, paymentSession.payment_session_id);
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
            };
        }
        catch (error) {
            return {
                status: "error",
                message: error.message || "Failed to create order and payment session",
                data: null,
            };
        }
    }
    async verifyPayment(orderId) {
        try {
            const paymentData = await this.paymentsService.getPaymentStatusByOrderId(orderId);
            return {
                status: "success",
                message: "Payment status retrieved successfully",
                data: paymentData,
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
    async verifyPaymentByCashfreeId(cashfreeOrderId) {
        try {
            const paymentData = await this.paymentsService.getPaymentByCashfreeOrderId(cashfreeOrderId);
            return {
                status: "success",
                message: "Payment status retrieved successfully",
                data: paymentData,
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
    async handleWebhook(webhookData) {
        try {
            const result = await this.paymentsService.handleWebhook(webhookData);
            return result;
        }
        catch (error) {
            return {
                status: "error",
                message: error.message,
            };
        }
    }
    async retryPayment(retryPaymentDto, req) {
        try {
            const { id: userId } = req.user;
            const result = await this.paymentsService.retryPayment(retryPaymentDto.orderId, userId);
            return {
                status: "success",
                message: "New order created successfully for payment retry.",
                data: result,
            };
        }
        catch (error) {
            return {
                status: "error",
                message: error.message || "Failed to create new order for payment retry.",
                data: null,
            };
        }
    }
    async getAllPayments(page = 1, limit = 10, search, status, fromDate, toDate) {
        try {
            const result = await this.paymentsService.getAllPayments(Number(page), Number(limit), search, status, fromDate, toDate);
            return {
                status: "success",
                message: "Payments retrieved successfully",
                data: result,
            };
        }
        catch (error) {
            return {
                status: "error",
                message: error.message || "Failed to retrieve payments",
                data: null,
            };
        }
    }
    async getPaymentDetails(id) {
        try {
            const result = await this.paymentsService.getPaymentDetails(id);
            return {
                status: "success",
                message: "Payment details retrieved successfully",
                data: result,
            };
        }
        catch (error) {
            return {
                status: "error",
                message: error.message || "Failed to retrieve payment details",
                data: null,
            };
        }
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("create-order"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_payment_dto_1.CreatePaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createCashfreeOrder", null);
__decorate([
    (0, common_1.Get)("verify/:orderId"),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Get)("verify-by-cashfree/:cashfreeOrderId"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "verifyPaymentByCashfreeId", null);
__decorate([
    (0, common_1.Post)("webhook"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("retry"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [retry_payment_dto_1.RetryPaymentDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "retryPayment", null);
__decorate([
    (0, common_1.Get)("admin"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Query)("page")),
    __param(1, (0, common_1.Query)("limit")),
    __param(2, (0, common_1.Query)("search")),
    __param(3, (0, common_1.Query)("status")),
    __param(4, (0, common_1.Query)("fromDate")),
    __param(5, (0, common_1.Query)("toDate")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getAllPayments", null);
__decorate([
    (0, common_1.Get)("admin/:id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentDetails", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)("payment"),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService,
        prisma_service_1.PrismaService,
        orders_service_1.OrdersService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map