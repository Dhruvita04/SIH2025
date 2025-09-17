import { PrismaService } from "../prisma/prisma.service";
import { ImageService } from "../utils/image.service";
import { UserDto, OrderDto } from "./dto/user.dto";
export declare class UserService {
    private readonly prisma;
    private readonly imageService;
    constructor(prisma: PrismaService, imageService: ImageService);
    private sanitizeUser;
    private sanitizeOrder;
    findAll(page?: number, limit?: number, search?: string): Promise<{
        data: UserDto[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<UserDto>;
    findUserOrders(userId: string, page?: number, limit?: number, search?: string): Promise<{
        data: OrderDto[];
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
    }>;
}
