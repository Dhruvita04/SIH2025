import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/CreateOrderDto.dto";
import { UpdateOrderStatusWithBatchesDto } from "./dto/UpdateOrderStatusWithBatchesDto.dto";
import { AddBatchesToOrderDto } from "./dto/AddBatchesToOrderDto.dto";
import { UpdateBatchesDto } from "./dto/UpdateBatchesDto.dto";
import { BatchSuggestionsDto } from "./dto/BatchSuggestionsDto.dto";
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    getUserOrders(req: any, page?: number, limit?: string, status?: string): Promise<{
        status: string;
        message: string;
        data: {
            orders: any;
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
    createOrder(order: CreateOrderDto): Promise<{
        status: string;
        message: string;
        data: {
            orderId: string;
            orderNumber: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            orderTotal: number;
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    getOrders(id: string): Promise<{
        status: string;
        message: string;
        data: {
            details: any;
            pdf: string;
        };
    }>;
    getAllOrders(page?: number, limit?: number, search?: string, status?: string, fromDate?: string, toDate?: string): Promise<{
        status: string;
        message: string;
        data: {
            orders: any;
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
    getOrderDetails(id: string): Promise<{
        status: string;
        message: string;
        data: any;
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    addBatchesToOrder(id: string, addBatchesDto: AddBatchesToOrderDto): Promise<{
        status: string;
        message: string;
        data: any;
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    updateOrderBatches(id: string, updateBatchesDto: UpdateBatchesDto): Promise<{
        status: string;
        message: string;
        data: any;
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    updateOrderStatus(id: string, updateDto: UpdateOrderStatusWithBatchesDto): Promise<{
        status: string;
        message: string;
        data: any;
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    getOrderDetailsByUser(id: string): Promise<{
        status: string;
        message: string;
        data: any;
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    getBatchSuggestions(body: BatchSuggestionsDto): Promise<{
        status: string;
        message: string;
        data: any;
    } | {
        status: string;
        message: any;
        data: any;
    }>;
}
