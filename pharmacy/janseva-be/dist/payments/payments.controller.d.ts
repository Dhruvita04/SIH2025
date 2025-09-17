import { PaymentsService } from "./payments.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { PrismaService } from "../prisma/prisma.service";
import { OrdersService } from "../orders/orders.service";
import { RetryPaymentDto } from "./dto/retry-payment.dto";
import { type PaymentStatus } from "@prisma/client";
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly prisma;
    private readonly ordersService;
    constructor(paymentsService: PaymentsService, prisma: PrismaService, ordersService: OrdersService);
    createCashfreeOrder(req: any, createPaymentDto: CreatePaymentDto): Promise<{
        status: string;
        message: string;
        data: {
            order: {
                id: string;
                orderId: string;
                status: import(".prisma/client").$Enums.OrderStatus;
                orderTotal: number;
            };
            paymentSession: {
                payment_session_id: any;
                order_id: string;
            };
            paymentId: string;
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    verifyPayment(orderId: string): Promise<{
        status: string;
        message: string;
        data: {
            paymentId: string;
            orderId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            method: import(".prisma/client").$Enums.PaymentMethod;
            amount: number;
            gatewayOrderId: string;
            transactionId: string;
            paymentDate: Date;
            order: {
                id: string;
                status: import(".prisma/client").$Enums.OrderStatus;
                orderId: string;
                orderTotal: number;
            };
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    verifyPaymentByCashfreeId(cashfreeOrderId: string): Promise<{
        status: string;
        message: string;
        data: {
            paymentId: string;
            orderId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            method: import(".prisma/client").$Enums.PaymentMethod;
            amount: number;
            gatewayOrderId: string;
            transactionId: string;
            paymentDate: Date;
            order: {
                id: string;
                status: import(".prisma/client").$Enums.OrderStatus;
                orderId: string;
                orderTotal: number;
            };
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    handleWebhook(webhookData: any): Promise<{
        status: string;
        message?: undefined;
    } | {
        status: string;
        message: any;
    }>;
    retryPayment(retryPaymentDto: RetryPaymentDto, req: any): Promise<{
        status: string;
        message: string;
        data: {
            orderId: string;
            orderNumber: string;
            paymentSession: {
                payment_session_id: any;
                order_id: string;
            };
            message: string;
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    getAllPayments(page?: number, limit?: number, search?: string, status?: PaymentStatus, fromDate?: string, toDate?: string): Promise<{
        status: string;
        message: string;
        data: {
            data: any;
            pagination: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    getPaymentDetails(id: string): Promise<{
        status: string;
        message: string;
        data: any;
    } | {
        status: string;
        message: any;
        data: any;
    }>;
}
