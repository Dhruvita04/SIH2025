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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const uuid_1 = require("uuid");
const pdf_service_1 = require("../utils/pdf.service");
const image_service_1 = require("../utils/image.service");
let OrdersService = class OrdersService {
    constructor(prisma, pdfService, imageService) {
        this.prisma = prisma;
        this.pdfService = pdfService;
        this.imageService = imageService;
    }
    async createOrder(order) {
        return this.prisma.$transaction(async (tx) => {
            if (!order.addressId) {
                throw new common_1.BadRequestException("Address ID is required to create an order.");
            }
            if (!order.items || order.items.length === 0) {
                throw new common_1.BadRequestException("Order must contain at least one item.");
            }
            const currentOrderId = (0, uuid_1.v4)();
            const today = new Date();
            const datePrefix = today.getFullYear().toString() +
                (today.getMonth() + 1).toString().padStart(2, "0") +
                today.getDate().toString().padStart(2, "0");
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            const todayOrderCount = await tx.order.count({
                where: {
                    createdAt: {
                        gte: startOfDay,
                        lt: endOfDay,
                    },
                },
            });
            const sequentialNumber = (todayOrderCount + 1).toString().padStart(6, "0");
            const userFriendlyOrderId = datePrefix + sequentialNumber;
            const userAddress = await tx.address.findUnique({
                where: { id: order.addressId },
            });
            if (!userAddress) {
                throw new common_1.BadRequestException("Shipping address not found with the provided ID.");
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
            });
            const gstPercentage = Number.parseFloat(process.env.GST_PERCENTAGE || "18");
            const appStateCode = (process.env.STATE_CODE || "Maharashtra").trim().toUpperCase();
            let beCalculatedSubTotal = 0;
            let beCalculatedProductDiscountTotal = 0;
            let beCalculatedCgst = 0;
            let beCalculatedSgst = 0;
            let beCalculatedIgst = 0;
            const orderProductsData = [];
            const stockUpdatePromises = [];
            for (const item of order.items) {
                const variant = await tx.productVariant.findUnique({
                    where: { id: item.variantId },
                    include: { product: true },
                });
                if (!variant) {
                    throw new common_1.BadRequestException(`Product variant with ID ${item.variantId} not found.`);
                }
                if (variant.stock < item.quantity) {
                    throw new common_1.BadRequestException(`Not enough stock for ${variant.product.name} - ${variant.name}. Available: ${variant.stock}, Requested: ${item.quantity}.`);
                }
                const originalPriceInclusive = variant.price;
                let discountedPriceInclusive;
                if (variant.discountType.toUpperCase() === "PERCENTAGE") {
                    discountedPriceInclusive = originalPriceInclusive * (1 - variant.discount / 100);
                }
                else {
                    discountedPriceInclusive = originalPriceInclusive - variant.discount;
                }
                discountedPriceInclusive = Math.max(0, discountedPriceInclusive);
                const itemProductDiscount = originalPriceInclusive - discountedPriceInclusive;
                const quantity = item.quantity;
                beCalculatedProductDiscountTotal += itemProductDiscount * quantity;
                const finalPriceInclusivePerUnit = Number.parseFloat(discountedPriceInclusive.toFixed(2));
                if (Math.abs(finalPriceInclusivePerUnit - item.price) > 0.01) {
                    throw new common_1.BadRequestException(`Price mismatch for product ${variant.product.name} - ${variant.name}. Expected: ${finalPriceInclusivePerUnit}, Received: ${item.price}`);
                }
                const itemSubTotal = finalPriceInclusivePerUnit * quantity;
                beCalculatedSubTotal += itemSubTotal;
                const exclusivePricePerUnit = finalPriceInclusivePerUnit / (1 + gstPercentage / 100);
                const gstAmountPerUnit = finalPriceInclusivePerUnit - exclusivePricePerUnit;
                if (userAddress.state.trim().toUpperCase() === appStateCode) {
                    beCalculatedCgst += (gstAmountPerUnit / 2) * quantity;
                    beCalculatedSgst += (gstAmountPerUnit / 2) * quantity;
                }
                else {
                    beCalculatedIgst += gstAmountPerUnit * quantity;
                }
                orderProductsData.push({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: finalPriceInclusivePerUnit,
                    originalPrice: originalPriceInclusive,
                    productDiscount: itemProductDiscount,
                });
                stockUpdatePromises.push(tx.productVariant.update({
                    where: { id: item.variantId },
                    data: { stock: { decrement: item.quantity } },
                }));
            }
            const beFinalSubTotal = Number.parseFloat(beCalculatedSubTotal.toFixed(2));
            const beFinalProductDiscount = Number.parseFloat(beCalculatedProductDiscountTotal.toFixed(2));
            const beFinalCgst = Number.parseFloat(beCalculatedCgst.toFixed(2));
            const beFinalSgst = Number.parseFloat(beCalculatedSgst.toFixed(2));
            const beFinalIgst = Number.parseFloat(beCalculatedIgst.toFixed(2));
            let beCalculatedCouponDiscount = 0;
            let appliedCoupon = null;
            if (order.couponId) {
                appliedCoupon = await tx.coupon.findUnique({
                    where: { code: order.couponId },
                });
                if (!appliedCoupon) {
                    throw new common_1.BadRequestException(`Coupon with code ${order.couponId} not found.`);
                }
                if (!appliedCoupon.isActive) {
                    throw new common_1.BadRequestException("This coupon is not active.");
                }
                const currentDate = new Date();
                if (currentDate < appliedCoupon.startDate || currentDate > appliedCoupon.endDate) {
                    throw new common_1.BadRequestException("This coupon has expired or is not yet valid.");
                }
                if (appliedCoupon.minPurchaseAmount && beFinalSubTotal < Number(appliedCoupon.minPurchaseAmount)) {
                    throw new common_1.BadRequestException(`Minimum purchase amount of ₹${appliedCoupon.minPurchaseAmount} required for this coupon.`);
                }
                if (appliedCoupon.discountType === client_1.CouponType.PERCENTAGE) {
                    beCalculatedCouponDiscount = (beFinalSubTotal * Number(appliedCoupon.discountValue)) / 100;
                }
                else {
                    beCalculatedCouponDiscount = Number(appliedCoupon.discountValue);
                }
                beCalculatedCouponDiscount = Math.min(beCalculatedCouponDiscount, beFinalSubTotal);
                beCalculatedCouponDiscount = Number.parseFloat(beCalculatedCouponDiscount.toFixed(2));
                await tx.coupon.update({
                    where: { id: appliedCoupon.id },
                    data: { uses: { increment: 1 } },
                });
            }
            const minimumOrderForFreeShipping = Number.parseFloat(process.env.MINIMUM_ORDER_FREE_SHIPPING || "1000");
            const shippingAmount = Number.parseFloat(process.env.SHIPPING_AMOUNT || "50");
            const subtotalAfterCouponDiscount = beFinalSubTotal - beCalculatedCouponDiscount;
            const beCalculatedShipping = subtotalAfterCouponDiscount >= minimumOrderForFreeShipping ? 0 : shippingAmount;
            const beFinalOrderTotal = Number.parseFloat((beFinalSubTotal - beCalculatedCouponDiscount + beCalculatedShipping).toFixed(2));
            const tolerance = 0.01;
            if (Math.abs(order.subTotal - beFinalSubTotal) > tolerance) {
                throw new common_1.BadRequestException(`Subtotal mismatch. FE: ${order.subTotal}, BE: ${beFinalSubTotal}`);
            }
            if (order.couponId && Math.abs(order.discount - beCalculatedCouponDiscount) > tolerance) {
                throw new common_1.BadRequestException(`Coupon discount mismatch. FE: ${order.discount}, BE: ${beCalculatedCouponDiscount}`);
            }
            if (!order.couponId && order.discount > 0) {
            }
            if (Math.abs(order.shipping - beCalculatedShipping) > tolerance) {
                throw new common_1.BadRequestException(`Shipping mismatch. FE: ${order.shipping}, BE: ${beCalculatedShipping}`);
            }
            if (Math.abs(order.orderTotal - beFinalOrderTotal) > tolerance) {
                throw new common_1.BadRequestException(`Order total mismatch. FE: ${order.orderTotal}, BE: ${beFinalOrderTotal}`);
            }
            const createdOrder = await tx.order.create({
                data: {
                    id: currentOrderId,
                    orderId: userFriendlyOrderId,
                    date: new Date(),
                    status: client_1.OrderStatus.PAYMENT_PENDING,
                    subTotal: beFinalSubTotal,
                    discount: beFinalProductDiscount,
                    couponDiscount: beCalculatedCouponDiscount,
                    shipping: beCalculatedShipping,
                    cgst: beFinalCgst,
                    sgst: beFinalSgst,
                    igst: beFinalIgst,
                    orderTotal: beFinalOrderTotal,
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
            });
            await Promise.all(stockUpdatePromises);
            return {
                ...createdOrder,
                message: "Order created successfully with PAYMENT_PENDING status",
            };
        }, {
            isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable,
        });
    }
    async getOrderStatus(id) {
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
                            shippedBatches: true,
                        },
                    },
                    payment: true,
                    shippedBatches: true,
                },
            });
            if (!order) {
                throw new Error("Order not found");
            }
            const deliveryDays = Number.parseInt(process.env.DELIVERY_DAYS || "7", 10);
            const expectedDeliveryDate = new Date(order.date.getTime() + deliveryDays * 24 * 60 * 60 * 1000);
            const returnDaysLimit = Number.parseInt(process.env.RETURN_DAYS_LIMIT || "7", 10);
            const returnWindowEndDate = new Date(expectedDeliveryDate.getTime() + returnDaysLimit * 24 * 60 * 60 * 1000);
            const repaymentWindowMinutes = Number.parseInt(process.env.REPAYMENT_WINDOW_MINUTES || "30", 10);
            const orderCreationTime = new Date(order.createdAt);
            const now = new Date();
            const minutesSinceCreation = (now.getTime() - orderCreationTime.getTime()) / (1000 * 60);
            const canRetryPayment = order.status === client_1.OrderStatus.PAYMENT_FAILED && minutesSinceCreation <= repaymentWindowMinutes;
            const canCancel = order.status === client_1.OrderStatus.PLACED || order.status === client_1.OrderStatus.PAYMENT_PENDING;
            const canReturn = order.status === client_1.OrderStatus.DELIVERED && new Date() <= returnWindowEndDate;
            const pdf = await this.pdfService.generateOrderPdf(order);
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
            };
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async getAllOrders(page, limit, search, status, fromDate, toDate) {
        try {
            const skip = (page - 1) * limit;
            const where = {
                ...(search && {
                    OR: [
                        { orderId: { contains: search, mode: "insensitive" } },
                        { user: { name: { contains: search, mode: "insensitive" } } },
                        { user: { email: { contains: search, mode: "insensitive" } } },
                        { shippingAddress: { name: { contains: search, mode: "insensitive" } } },
                    ],
                }),
                ...(status && status !== "ALL" && { status: status }),
            };
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
                                shippedBatches: true,
                            },
                        },
                        payment: true,
                        shippedBatches: true,
                    },
                }),
                this.prisma.order.count({ where }),
            ]);
            const ordersWithPdf = await Promise.all(orders.map(async (order) => {
                const pdf = await this.pdfService.generateOrderPdf(order);
                return {
                    ...order,
                    pdf,
                };
            }));
            return {
                orders: this.formatDatesInObject(ordersWithPdf),
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async getOrderDetails(id) {
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
                            shippedBatches: true,
                        },
                    },
                    payment: true,
                    shippedBatches: true,
                },
            });
            if (!order) {
                throw new Error("Order not found");
            }
            if (order.user && !order.user.phone && order.shippingAddress && order.shippingAddress.phone) {
                order.user.phone = order.shippingAddress.phone;
            }
            let originalPriceTotal = 0;
            let productDiscountTotal = 0;
            for (const orderProduct of order.products) {
                const itemOriginalPrice = orderProduct.originalPrice * orderProduct.quantity;
                const itemProductDiscount = orderProduct.productDiscount * orderProduct.quantity;
                originalPriceTotal += itemOriginalPrice;
                productDiscountTotal += itemProductDiscount;
            }
            originalPriceTotal = Number.parseFloat(originalPriceTotal.toFixed(2));
            productDiscountTotal = Number.parseFloat(productDiscountTotal.toFixed(2));
            const subtotalAfterProductDiscount = Number.parseFloat((originalPriceTotal - productDiscountTotal).toFixed(2));
            const orderSummary = {
                originalPrice: originalPriceTotal,
                productDiscount: productDiscountTotal,
                subtotal: subtotalAfterProductDiscount,
                couponDiscount: order.couponDiscount || 0,
                shipping: order.shipping || 0,
                total: order.orderTotal,
                cgst: order.cgst || 0,
                sgst: order.sgst || 0,
                igst: order.igst || 0,
            };
            if (Math.abs(subtotalAfterProductDiscount - order.subTotal) > 0.01) {
                console.warn(`Subtotal calculation mismatch: Calculated=${subtotalAfterProductDiscount}, Stored=${order.subTotal}`);
            }
            let prescriptionDetails = null;
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
                });
                if (prescription) {
                    try {
                        const signedUrl = await this.imageService.getSignedUrl("prescriptions", prescription.prescriptionUrl, 60);
                        prescriptionDetails = {
                            ...prescription,
                            prescriptionUrl: signedUrl,
                        };
                    }
                    catch (error) {
                        console.error("Error getting signed URL:", error);
                        prescriptionDetails = {
                            ...prescription,
                            prescriptionUrl: prescription.prescriptionUrl,
                            signedUrlError: "Failed to generate signed URL",
                        };
                    }
                }
            }
            let shippingDetails = null;
            if (order.shippingDetailsId) {
                shippingDetails = await this.prisma.shippingDetails.findUnique({
                    where: { id: order.shippingDetailsId },
                });
            }
            const availableStatuses = [];
            const currentStatus = order.status;
            switch (currentStatus) {
                case client_1.OrderStatus.PAYMENT_PENDING:
                    availableStatuses.push(client_1.OrderStatus.PAYMENT_FAILED, client_1.OrderStatus.PLACED);
                    break;
                case client_1.OrderStatus.PAYMENT_FAILED:
                    availableStatuses.push(client_1.OrderStatus.PAYMENT_PENDING);
                    break;
                case client_1.OrderStatus.PLACED:
                    availableStatuses.push(client_1.OrderStatus.SHIPPED, client_1.OrderStatus.REFUNDED, client_1.OrderStatus.PAYMENT_FAILED, client_1.OrderStatus.PAYMENT_PENDING);
                    break;
                case client_1.OrderStatus.SHIPPED:
                    availableStatuses.push(client_1.OrderStatus.IN_TRANSIT, client_1.OrderStatus.PLACED);
                    break;
                case client_1.OrderStatus.IN_TRANSIT:
                    availableStatuses.push(client_1.OrderStatus.DELIVERED, client_1.OrderStatus.SHIPPED);
                    break;
                case client_1.OrderStatus.DELIVERED:
                    availableStatuses.push(client_1.OrderStatus.RETURNED, client_1.OrderStatus.IN_TRANSIT);
                    break;
                case client_1.OrderStatus.RETURNED:
                    availableStatuses.push(client_1.OrderStatus.REFUNDED, client_1.OrderStatus.DELIVERED);
                    break;
                case client_1.OrderStatus.REFUNDED:
                    availableStatuses.push(client_1.OrderStatus.RETURNED);
                    break;
                default:
                    break;
            }
            const deliveryDays = Number.parseInt(process.env.DELIVERY_DAYS || "7", 10);
            const expectedDeliveryDate = new Date(order.date.getTime() + deliveryDays * 24 * 60 * 60 * 1000);
            const returnDaysLimit = Number.parseInt(process.env.RETURN_DAYS_LIMIT || "7", 10);
            const returnWindowEndDate = new Date(expectedDeliveryDate.getTime() + returnDaysLimit * 24 * 60 * 60 * 1000);
            const repaymentWindowMinutes = Number.parseInt(process.env.REPAYMENT_WINDOW_MINUTES || "30", 10);
            const orderCreationTime = new Date(order.createdAt);
            const now = new Date();
            const minutesSinceCreation = (now.getTime() - orderCreationTime.getTime()) / (1000 * 60);
            const canRetryPayment = order.status === client_1.OrderStatus.PAYMENT_FAILED && minutesSinceCreation <= repaymentWindowMinutes;
            const canCancel = order.status === client_1.OrderStatus.PLACED || order.status === client_1.OrderStatus.PAYMENT_PENDING;
            const canReturn = order.status === client_1.OrderStatus.DELIVERED && new Date() <= returnWindowEndDate;
            const pdf = await this.pdfService.generateOrderPdf(order);
            let statusHistoryString;
            switch (currentStatus) {
                case client_1.OrderStatus.PAYMENT_PENDING:
                    statusHistoryString = "PAYMENT_PENDING";
                    break;
                case client_1.OrderStatus.PAYMENT_FAILED:
                    statusHistoryString = "PAYMENT_PENDING -> PAYMENT_FAILED";
                    break;
                case client_1.OrderStatus.PLACED:
                    if (order.payment && order.payment.status === "FAILED") {
                        statusHistoryString = "PAYMENT_PENDING -> PAYMENT_FAILED -> PLACED";
                    }
                    else {
                        statusHistoryString = "PAYMENT_PENDING -> PLACED";
                    }
                    break;
                case client_1.OrderStatus.SHIPPED:
                    if (order.payment && order.payment.status === "FAILED") {
                        statusHistoryString = "PAYMENT_PENDING -> PAYMENT_FAILED -> PLACED -> SHIPPED";
                    }
                    else {
                        statusHistoryString = "PAYMENT_PENDING -> PLACED -> SHIPPED";
                    }
                    break;
                case client_1.OrderStatus.IN_TRANSIT:
                    if (order.payment && order.payment.status === "FAILED") {
                        statusHistoryString = "PAYMENT_PENDING -> PAYMENT_FAILED -> PLACED -> SHIPPED -> IN_TRANSIT";
                    }
                    else {
                        statusHistoryString = "PAYMENT_PENDING -> PLACED -> SHIPPED -> IN_TRANSIT";
                    }
                    break;
                case client_1.OrderStatus.DELIVERED:
                    if (order.payment && order.payment.status === "FAILED") {
                        statusHistoryString = "PAYMENT_PENDING -> PAYMENT_FAILED -> PLACED -> SHIPPED -> IN_TRANSIT -> DELIVERED";
                    }
                    else {
                        statusHistoryString = "PAYMENT_PENDING -> PLACED -> SHIPPED -> IN_TRANSIT -> DELIVERED";
                    }
                    break;
                case client_1.OrderStatus.RETURNED:
                    if (order.payment && order.payment.status === "FAILED") {
                        statusHistoryString =
                            "PAYMENT_PENDING -> PAYMENT_FAILED -> PLACED -> SHIPPED -> IN_TRANSIT -> DELIVERED -> RETURNED";
                    }
                    else {
                        statusHistoryString = "PAYMENT_PENDING -> PLACED -> SHIPPED -> IN_TRANSIT -> DELIVERED -> RETURNED";
                    }
                    break;
                case client_1.OrderStatus.REFUNDED:
                    if (shippingDetails && (shippingDetails.trackingNumber || shippingDetails.trackingURL)) {
                        if (order.payment && order.payment.status === "FAILED") {
                            statusHistoryString =
                                "PAYMENT_PENDING -> PAYMENT_FAILED -> PLACED -> SHIPPED -> IN_TRANSIT -> DELIVERED -> RETURNED -> REFUNDED";
                        }
                        else {
                            statusHistoryString =
                                "PAYMENT_PENDING -> PLACED -> SHIPPED -> IN_TRANSIT -> DELIVERED -> RETURNED -> REFUNDED";
                        }
                    }
                    else {
                        if (order.payment && order.payment.status === "FAILED") {
                            statusHistoryString = "PAYMENT_PENDING -> PAYMENT_FAILED -> PLACED -> REFUNDED";
                        }
                        else {
                            statusHistoryString = "PAYMENT_PENDING -> PLACED -> REFUNDED";
                        }
                    }
                    break;
                default:
                    statusHistoryString = currentStatus;
                    break;
            }
            const { subTotal, discount, couponDiscount, shipping, cgst, sgst, igst, orderTotal, ...cleanOrder } = order;
            return this.formatDatesInObject({
                ...cleanOrder,
                orderSummary,
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
            });
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async addBatchesToOrder(orderId, shippedBatches) {
        try {
            const order = await this.prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    products: {
                        include: {
                            product: true,
                        },
                    },
                },
            });
            if (!order) {
                throw new common_1.BadRequestException("Order not found.");
            }
            if (order.status !== client_1.OrderStatus.PLACED) {
                throw new common_1.BadRequestException("Batches can only be added to orders with PLACED status.");
            }
            if (!shippedBatches || shippedBatches.length === 0) {
                throw new common_1.BadRequestException("At least one batch is required.");
            }
            const orderProductIds = order.products.map((p) => p.id);
            const batchOrderProductIds = shippedBatches.map((b) => b.orderProductId);
            const invalidIds = batchOrderProductIds.filter((id) => !orderProductIds.includes(id));
            if (invalidIds.length > 0) {
                throw new common_1.BadRequestException(`Invalid order product IDs: ${invalidIds.join(", ")}`);
            }
            const quantityValidation = new Map();
            for (const batch of shippedBatches) {
                const currentQty = quantityValidation.get(batch.orderProductId) || 0;
                quantityValidation.set(batch.orderProductId, currentQty + batch.quantity);
            }
            for (const orderProduct of order.products) {
                const batchTotalQty = quantityValidation.get(orderProduct.id) || 0;
                if (batchTotalQty > orderProduct.quantity) {
                    throw new common_1.BadRequestException(`Batch quantities (${batchTotalQty}) exceed order quantity (${orderProduct.quantity}) for order product ${orderProduct.id}`);
                }
            }
            return await this.prisma.$transaction(async (tx) => {
                const batchData = shippedBatches.map((batch) => {
                    const orderProduct = order.products.find((p) => p.id === batch.orderProductId);
                    const hsnCode = orderProduct?.product?.hsnCode || null;
                    return {
                        orderId: orderId,
                        orderProductId: batch.orderProductId,
                        batchNumber: batch.batchNumber,
                        expiryDate: new Date(batch.expiryDate),
                        quantity: batch.quantity,
                        hsnCode: hsnCode,
                    };
                });
                const createdBatches = await tx.shippedBatch.createMany({
                    data: batchData,
                });
                for (const batch of shippedBatches) {
                    const orderProduct = order.products.find((p) => p.id === batch.orderProductId);
                    if (orderProduct) {
                        const newExpiryDate = new Date(batch.expiryDate);
                        const existingBatch = await tx.productBatch.findFirst({
                            where: {
                                productId: orderProduct.productId,
                                variantId: orderProduct.variantId,
                                batchNo: batch.batchNumber,
                                expiryDate: newExpiryDate,
                            },
                        });
                        if (!existingBatch) {
                            await tx.productBatch.create({
                                data: {
                                    productId: orderProduct.productId,
                                    variantId: orderProduct.variantId,
                                    batchNo: batch.batchNumber,
                                    expiryDate: newExpiryDate,
                                },
                            });
                        }
                    }
                }
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
                });
                return this.formatDatesInObject({
                    orderId,
                    batchesAdded: createdBatches.count,
                    batches,
                });
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new Error(error);
        }
    }
    async updateOrderBatches(orderId, shippedBatches) {
        try {
            const order = await this.prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    products: {
                        include: {
                            product: true,
                        },
                    },
                },
            });
            if (!order) {
                throw new common_1.BadRequestException("Order not found.");
            }
            if (order.status !== client_1.OrderStatus.PLACED) {
                throw new common_1.BadRequestException("Batches can only be updated for orders with PLACED status.");
            }
            if (!shippedBatches || shippedBatches.length === 0) {
                throw new common_1.BadRequestException("At least one batch is required.");
            }
            const orderProductIds = order.products.map((p) => p.id);
            const batchOrderProductIds = shippedBatches.map((b) => b.orderProductId);
            const invalidIds = batchOrderProductIds.filter((id) => !orderProductIds.includes(id));
            if (invalidIds.length > 0) {
                throw new common_1.BadRequestException(`Invalid order product IDs: ${invalidIds.join(", ")}`);
            }
            const quantityValidation = new Map();
            for (const batch of shippedBatches) {
                const currentQty = quantityValidation.get(batch.orderProductId) || 0;
                quantityValidation.set(batch.orderProductId, currentQty + batch.quantity);
            }
            for (const orderProduct of order.products) {
                const batchTotalQty = quantityValidation.get(orderProduct.id) || 0;
                if (batchTotalQty > orderProduct.quantity) {
                    throw new common_1.BadRequestException(`Batch quantities (${batchTotalQty}) exceed order quantity (${orderProduct.quantity}) for order product ${orderProduct.id}`);
                }
            }
            return await this.prisma.$transaction(async (tx) => {
                await tx.shippedBatch.deleteMany({
                    where: { orderId: orderId },
                });
                const batchData = shippedBatches.map((batch) => {
                    const orderProduct = order.products.find((p) => p.id === batch.orderProductId);
                    const hsnCode = orderProduct?.product?.hsnCode || null;
                    return {
                        orderId: orderId,
                        orderProductId: batch.orderProductId,
                        batchNumber: batch.batchNumber,
                        expiryDate: new Date(batch.expiryDate),
                        quantity: batch.quantity,
                        hsnCode: hsnCode,
                    };
                });
                const createdBatches = await tx.shippedBatch.createMany({
                    data: batchData,
                });
                for (const batch of shippedBatches) {
                    const orderProduct = order.products.find((p) => p.id === batch.orderProductId);
                    if (orderProduct) {
                        const newExpiryDate = new Date(batch.expiryDate);
                        const existingBatch = await tx.productBatch.findFirst({
                            where: {
                                productId: orderProduct.productId,
                                variantId: orderProduct.variantId,
                                batchNo: batch.batchNumber,
                                expiryDate: newExpiryDate,
                            },
                        });
                        if (!existingBatch) {
                            await tx.productBatch.create({
                                data: {
                                    productId: orderProduct.productId,
                                    variantId: orderProduct.variantId,
                                    batchNo: batch.batchNumber,
                                    expiryDate: newExpiryDate,
                                },
                            });
                        }
                    }
                }
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
                });
                return this.formatDatesInObject({
                    orderId,
                    batchesUpdated: createdBatches.count,
                    batches,
                });
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new Error(error);
        }
    }
    async updateOrderStatusWithBatches(orderId, newStatus, trackingDetails) {
        try {
            const order = await this.prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    products: {
                        include: {
                            product: true,
                        },
                    },
                    shippedBatches: true,
                },
            });
            if (!order) {
                throw new common_1.BadRequestException("Order not found.");
            }
            const availableStatuses = [];
            const currentStatus = order.status;
            switch (currentStatus) {
                case client_1.OrderStatus.PAYMENT_PENDING:
                    availableStatuses.push(client_1.OrderStatus.PAYMENT_FAILED, client_1.OrderStatus.PLACED);
                    break;
                case client_1.OrderStatus.PAYMENT_FAILED:
                    availableStatuses.push(client_1.OrderStatus.PAYMENT_PENDING);
                    break;
                case client_1.OrderStatus.PLACED:
                    availableStatuses.push(client_1.OrderStatus.SHIPPED, client_1.OrderStatus.REFUNDED, client_1.OrderStatus.PAYMENT_FAILED, client_1.OrderStatus.PAYMENT_PENDING);
                    break;
                case client_1.OrderStatus.SHIPPED:
                    availableStatuses.push(client_1.OrderStatus.IN_TRANSIT, client_1.OrderStatus.PLACED);
                    break;
                case client_1.OrderStatus.IN_TRANSIT:
                    availableStatuses.push(client_1.OrderStatus.DELIVERED, client_1.OrderStatus.SHIPPED);
                    break;
                case client_1.OrderStatus.DELIVERED:
                    availableStatuses.push(client_1.OrderStatus.RETURNED, client_1.OrderStatus.IN_TRANSIT);
                    break;
                case client_1.OrderStatus.RETURNED:
                    availableStatuses.push(client_1.OrderStatus.REFUNDED, client_1.OrderStatus.DELIVERED);
                    break;
                case client_1.OrderStatus.REFUNDED:
                    availableStatuses.push(client_1.OrderStatus.RETURNED);
                    break;
                default:
                    break;
            }
            if (!availableStatuses.includes(newStatus)) {
                if (currentStatus === client_1.OrderStatus.PAYMENT_FAILED && newStatus === client_1.OrderStatus.PLACED) {
                    throw new common_1.BadRequestException(`Orders with PAYMENT_FAILED status cannot be directly moved to PLACED. The payment must be completed successfully first. Please use the payment retry functionality or update status to PAYMENT_PENDING.`);
                }
                throw new common_1.BadRequestException(`Invalid status transition from ${currentStatus} to ${newStatus}.`);
            }
            return await this.prisma.$transaction(async (tx) => {
                const dataToUpdate = { status: newStatus };
                if (newStatus === client_1.OrderStatus.SHIPPED) {
                    if (!trackingDetails ||
                        !trackingDetails.trackingURL ||
                        !trackingDetails.trackingNumber ||
                        !trackingDetails.courierName) {
                        throw new common_1.BadRequestException("Tracking URL, tracking number, and courier name are required when status is SHIPPED.");
                    }
                    const existingBatches = order.shippedBatches || [];
                    const providedBatches = trackingDetails.shippedBatches || [];
                    if (existingBatches.length === 0 && providedBatches.length === 0) {
                        throw new common_1.BadRequestException("Shipped batches are required when status is SHIPPED. Please add batches first or provide them in the request.");
                    }
                    if (providedBatches.length > 0) {
                        const orderProductIds = order.products.map((p) => p.id);
                        const batchOrderProductIds = providedBatches.map((b) => b.orderProductId);
                        const invalidIds = batchOrderProductIds.filter((id) => !orderProductIds.includes(id));
                        if (invalidIds.length > 0) {
                            throw new common_1.BadRequestException(`Invalid order product IDs: ${invalidIds.join(", ")}`);
                        }
                        const quantityValidation = new Map();
                        for (const batch of providedBatches) {
                            const currentQty = quantityValidation.get(batch.orderProductId) || 0;
                            quantityValidation.set(batch.orderProductId, currentQty + batch.quantity);
                        }
                        for (const orderProduct of order.products) {
                            const batchTotalQty = quantityValidation.get(orderProduct.id) || 0;
                            if (batchTotalQty > orderProduct.quantity) {
                                throw new common_1.BadRequestException(`Batch quantities (${batchTotalQty}) exceed order quantity (${orderProduct.quantity}) for order product ${orderProduct.id}`);
                            }
                        }
                        await tx.shippedBatch.deleteMany({
                            where: { orderId: orderId },
                        });
                        const batchData = providedBatches.map((batch) => {
                            const orderProduct = order.products.find((p) => p.id === batch.orderProductId);
                            const hsnCode = orderProduct?.product?.hsnCode || null;
                            return {
                                orderId: orderId,
                                orderProductId: batch.orderProductId,
                                batchNumber: batch.batchNumber,
                                expiryDate: new Date(batch.expiryDate),
                                quantity: batch.quantity,
                                hsnCode: hsnCode,
                            };
                        });
                        await tx.shippedBatch.createMany({
                            data: batchData,
                        });
                        for (const batch of providedBatches) {
                            const orderProduct = order.products.find((p) => p.id === batch.orderProductId);
                            if (orderProduct) {
                                const existingBatch = await tx.productBatch.findFirst({
                                    where: {
                                        productId: orderProduct.productId,
                                        variantId: orderProduct.variantId,
                                        batchNo: batch.batchNumber,
                                    },
                                });
                                const newExpiryDate = new Date(batch.expiryDate);
                                const shouldCreate = !existingBatch || existingBatch.expiryDate.getTime() !== newExpiryDate.getTime();
                                if (shouldCreate) {
                                    await tx.productBatch.create({
                                        data: {
                                            productId: orderProduct.productId,
                                            variantId: orderProduct.variantId,
                                            batchNo: batch.batchNumber,
                                            expiryDate: newExpiryDate,
                                        },
                                    });
                                }
                            }
                        }
                    }
                    if (order.shippingDetailsId) {
                        await tx.shippingDetails.update({
                            where: { id: order.shippingDetailsId },
                            data: {
                                trackingURL: trackingDetails.trackingURL,
                                trackingNumber: trackingDetails.trackingNumber,
                                courierName: trackingDetails.courierName,
                                orderId: order.id,
                            },
                        });
                    }
                    else {
                        const newShippingDetails = await tx.shippingDetails.create({
                            data: {
                                orderId: order.id,
                                trackingURL: trackingDetails.trackingURL,
                                trackingNumber: trackingDetails.trackingNumber,
                                courierName: trackingDetails.courierName,
                            },
                        });
                        dataToUpdate.shippingDetailsId = newShippingDetails.id;
                    }
                }
                else if (newStatus === client_1.OrderStatus.PLACED) {
                    if (order.shippingDetailsId) {
                        await tx.shippingDetails.update({
                            where: { id: order.shippingDetailsId },
                            data: {
                                trackingURL: null,
                                trackingNumber: null,
                                courierName: null,
                            },
                        });
                    }
                    await tx.shippedBatch.deleteMany({
                        where: { orderId: orderId },
                    });
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
                });
                return this.formatDatesInObject(updatedOrder);
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new Error(error);
        }
    }
    async updateOrderStatus(orderId, newStatus, trackingDetails) {
        return this.updateOrderStatusWithBatches(orderId, newStatus, trackingDetails);
    }
    async getUserOrders(id, page, limit, status) {
        try {
            const skip = (page - 1) * limit;
            const where = {
                userId: id,
                ...(status && status !== "ALL" && { status: status }),
            };
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
                        shippedBatches: true,
                    },
                }),
                this.prisma.order.count({ where }),
            ]);
            const deliveryDays = Number.parseInt(process.env.DELIVERY_DAYS || "7", 10);
            const returnDaysLimit = Number.parseInt(process.env.RETURN_DAYS_LIMIT || "7", 10);
            const ordersWithEstimatedDateAndActions = orders.map((order) => {
                const estimatedDeliveryDate = new Date(order.createdAt.getTime() + deliveryDays * 24 * 60 * 60 * 1000);
                const returnWindowEndDate = new Date(estimatedDeliveryDate.getTime() + returnDaysLimit * 24 * 60 * 60 * 1000);
                const repaymentWindowMinutes = Number.parseInt(process.env.REPAYMENT_WINDOW_MINUTES || "30", 10);
                const orderCreationTime = new Date(order.createdAt);
                const now = new Date();
                const minutesSinceCreation = (now.getTime() - orderCreationTime.getTime()) / (1000 * 60);
                const canRetryPayment = order.status === client_1.OrderStatus.PAYMENT_FAILED && minutesSinceCreation <= repaymentWindowMinutes;
                const canCancel = order.status === client_1.OrderStatus.PLACED || order.status === client_1.OrderStatus.PAYMENT_PENDING;
                const canReturn = order.status === client_1.OrderStatus.DELIVERED && new Date() <= returnWindowEndDate;
                return {
                    ...order,
                    estimatedDeliveryDate,
                    userActions: {
                        canCancel,
                        canReturn,
                        canRetryPayment,
                    },
                };
            });
            return {
                orders: this.formatDatesInObject(ordersWithEstimatedDateAndActions),
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async updateOrderStatusByPayment(orderId, paymentStatus) {
        try {
            let newOrderStatus;
            switch (paymentStatus) {
                case client_1.PaymentStatus.COMPLETED:
                    newOrderStatus = client_1.OrderStatus.PLACED;
                    break;
                case client_1.PaymentStatus.FAILED:
                    newOrderStatus = client_1.OrderStatus.PAYMENT_FAILED;
                    break;
                case client_1.PaymentStatus.PENDING:
                    newOrderStatus = client_1.OrderStatus.PAYMENT_PENDING;
                    break;
                default:
                    return;
            }
            const updatedOrder = await this.prisma.order.update({
                where: { id: orderId },
                data: {
                    status: newOrderStatus,
                    updatedAt: new Date(),
                },
            });
            console.log(`Order ${orderId} status updated to ${newOrderStatus} based on payment status ${paymentStatus}`);
            return updatedOrder;
        }
        catch (error) {
            console.error(`Error updating order status for order ${orderId}:`, error);
            throw error;
        }
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
    async getBatchSuggestions(productId, variantId, batchNo) {
        const whereClause = {
            productId,
            variantId,
        };
        if (batchNo) {
            whereClause.batchNo = {
                contains: batchNo,
                mode: "insensitive",
            };
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
        });
        return this.formatDatesInObject(batches);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pdf_service_1.PdfService,
        image_service_1.ImageService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map