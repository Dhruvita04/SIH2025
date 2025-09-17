import { OrderStatus, PaymentStatus } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateOrderDto } from "./dto/CreateOrderDto.dto";
import { PdfService } from "src/utils/pdf.service";
import { ImageService } from "src/utils/image.service";
import { ShippedBatchDto } from "./dto/ShippedBatchDto.dto";
export declare class OrdersService {
    private readonly prisma;
    private readonly pdfService;
    private readonly imageService;
    constructor(prisma: PrismaService, pdfService: PdfService, imageService: ImageService);
    createOrder(order: CreateOrderDto): Promise<{
        message: string;
        shippingAddress: {
            default: boolean;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            userId: string | null;
            line1: string;
            line2: string | null;
            city: string;
            state: string;
            postalCode: string;
        };
        products: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            price: number;
            productId: string;
            orderId: string;
            variantId: string;
            quantity: number;
            originalPrice: number;
            productDiscount: number;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        discount: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        orderId: string;
        userId: string;
        prescriptionId: string | null;
        orderNumber: bigint;
        paymentId: string | null;
        date: Date;
        shippingAddressId: string;
        couponId: string | null;
        subTotal: number;
        couponDiscount: number;
        shipping: number;
        cgst: number;
        sgst: number;
        igst: number;
        orderTotal: number;
        shippingDetailsId: string | null;
    }>;
    getOrderStatus(id: string): Promise<{
        details: any;
        pdf: string;
    }>;
    getAllOrders(page: number, limit: number, search?: string, status?: string, fromDate?: string, toDate?: string): Promise<{
        orders: any;
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getOrderDetails(id: string): Promise<any>;
    addBatchesToOrder(orderId: string, shippedBatches: ShippedBatchDto[]): Promise<any>;
    updateOrderBatches(orderId: string, shippedBatches: ShippedBatchDto[]): Promise<any>;
    updateOrderStatusWithBatches(orderId: string, newStatus: OrderStatus, trackingDetails?: {
        trackingURL?: string;
        trackingNumber?: string;
        courierName?: string;
        shippedBatches?: ShippedBatchDto[];
    }): Promise<any>;
    updateOrderStatus(orderId: string, newStatus: OrderStatus, trackingDetails?: {
        trackingURL?: string;
        trackingNumber?: string;
        courierName?: string;
    }): Promise<any>;
    getUserOrders(id: string, page: number, limit: number, status?: string): Promise<{
        orders: any;
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    updateOrderStatusByPayment(orderId: string, paymentStatus: PaymentStatus): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        discount: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        orderId: string;
        userId: string;
        prescriptionId: string | null;
        orderNumber: bigint;
        paymentId: string | null;
        date: Date;
        shippingAddressId: string;
        couponId: string | null;
        subTotal: number;
        couponDiscount: number;
        shipping: number;
        cgst: number;
        sgst: number;
        igst: number;
        orderTotal: number;
        shippingDetailsId: string | null;
    }>;
    private formatDatesInObject;
    getBatchSuggestions(productId: string, variantId: string, batchNo?: string): Promise<any>;
}
