import { UserService } from "./user.service";
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getAll(page?: string, limit?: string, search?: string): Promise<{
        status: string;
        message: string;
        data: {
            data: import("./dto/user.dto").UserDto[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        };
    }>;
    getUserOrders(userId: string, page?: string, limit?: string, search?: string): Promise<{
        status: string;
        message: string;
        data: {
            data: import("./dto/user.dto").OrderDto[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
            orderSummary: {
                totalOrders: number;
                totalSpent: number;
                lastOrderDate: string;
                statusBreakdown: {
                    PAYMENT_FAILED: number;
                    PLACED: number;
                    SHIPPED: number;
                    IN_TRANSIT: number;
                    DELIVERED: number;
                    RETURNED: number;
                    REFUNDED: number;
                };
            };
            searchApplied: boolean;
            searchTerm: string;
        };
    }>;
    getOne(id: string): Promise<{
        status: string;
        message: string;
        data: import("./dto/user.dto").UserDto;
    }>;
}
