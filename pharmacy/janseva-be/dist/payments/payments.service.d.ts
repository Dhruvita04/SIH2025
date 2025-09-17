import { PrismaService } from "src/prisma/prisma.service";
import { PaymentStatus } from "@prisma/client";
import { OrdersService } from "src/orders/orders.service";
interface CustomerDetails {
    email: string;
    phone: string;
    name: string;
}
export declare class PaymentsService {
    private readonly prisma;
    private readonly ordersService;
    private readonly apiBaseUrl;
    private readonly appId;
    private readonly secretKey;
    private readonly apiVersion;
    constructor(prisma: PrismaService, ordersService: OrdersService);
    private getAuthHeaders;
    createCashfreeOrder(amount: number, temporaryOrderId: string, userId: string, customer: CustomerDetails): Promise<{
        payment_session_id: any;
        order_id: string;
    }>;
    createPaymentRecord(orderId: string, userId: string, amount: number, gatewayOrderId: string, paymentSessionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        orderId: string;
        userId: string;
        amount: number;
        method: import(".prisma/client").$Enums.PaymentMethod;
        gateway: import(".prisma/client").$Enums.PaymentGateway;
        transactionId: string | null;
        gatewayOrderId: string | null;
        paymentSessionId: string | null;
        gatewayReferenceId: string | null;
        currency: string;
        callbackUrl: string | null;
        paymentDate: Date | null;
        confirmationDate: Date | null;
        errorMessage: string | null;
        isRefunded: boolean;
        refundDate: Date | null;
    }>;
    createOrUpdatePaymentRecord(orderId: string, userId: string, amount: number, gatewayOrderId: string, paymentSessionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        orderId: string;
        userId: string;
        amount: number;
        method: import(".prisma/client").$Enums.PaymentMethod;
        gateway: import(".prisma/client").$Enums.PaymentGateway;
        transactionId: string | null;
        gatewayOrderId: string | null;
        paymentSessionId: string | null;
        gatewayReferenceId: string | null;
        currency: string;
        callbackUrl: string | null;
        paymentDate: Date | null;
        confirmationDate: Date | null;
        errorMessage: string | null;
        isRefunded: boolean;
        refundDate: Date | null;
    }>;
    verifyPayment(orderId: string): Promise<any>;
    getOrderDetails(orderId: string): Promise<any>;
    getPaymentStatusByOrderId(orderId: string): Promise<{
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
    }>;
    handleWebhook(webhookData: any): Promise<{
        status: string;
        message?: undefined;
    } | {
        status: string;
        message: string;
    }>;
    getPaymentByCashfreeOrderId(cashfreeOrderId: string): Promise<{
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
    }>;
    private _processCashfreePaymentData;
    retryPayment(orderId: string, userId: string): Promise<{
        orderId: string;
        orderNumber: string;
        paymentSession: {
            payment_session_id: any;
            order_id: string;
        };
        message: string;
    }>;
    private formatDatesInObject;
    getAllPayments(page: number, limit: number, search?: string, status?: PaymentStatus, fromDate?: string, toDate?: string): Promise<{
        data: any;
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getPaymentDetails(paymentId: string): Promise<any>;
}
export {};
