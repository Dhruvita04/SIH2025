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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const CreateOrderDto_dto_1 = require("./dto/CreateOrderDto.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
const UpdateOrderStatusWithBatchesDto_dto_1 = require("./dto/UpdateOrderStatusWithBatchesDto.dto");
const AddBatchesToOrderDto_dto_1 = require("./dto/AddBatchesToOrderDto.dto");
const UpdateBatchesDto_dto_1 = require("./dto/UpdateBatchesDto.dto");
const BatchSuggestionsDto_dto_1 = require("./dto/BatchSuggestionsDto.dto");
let OrdersController = class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async getUserOrders(req, page = 1, limit = '10', status) {
        try {
            const userId = req.user.id;
            const pageNum = Number.parseInt(page.toString(), 10) || 1;
            const limitNum = Number.parseInt(limit, 10) || 10;
            const orders = await this.ordersService.getUserOrders(userId, pageNum, limitNum, status);
            return { status: "success", message: "Orders fetched successfully", data: orders };
        }
        catch (error) {
            return { status: "error", message: error.message || "An error occurred while fetching orders", data: null };
        }
    }
    async createOrder(order) {
        try {
            const result = await this.ordersService.createOrder(order);
            return {
                status: "success",
                message: result.message || 'Order created successfully with PAYMENT_PENDING status',
                data: {
                    orderId: result.id,
                    orderNumber: result.orderId,
                    status: result.status,
                    orderTotal: result.orderTotal
                }
            };
        }
        catch (error) {
            return {
                status: "error",
                message: error.message || 'An error occurred during order creation',
                data: null
            };
        }
    }
    async getOrders(id) {
        const orders = await this.ordersService.getOrderStatus(id);
        return { status: "success", message: 'Orders fetched successfully', data: orders };
    }
    async getAllOrders(page = 1, limit = 10, search, status, fromDate, toDate) {
        try {
            const pageNum = Number.parseInt(page.toString(), 10) || 1;
            const limitNum = Number.parseInt(limit.toString(), 10) || 10;
            const result = await this.ordersService.getAllOrders(pageNum, limitNum, search, status, fromDate, toDate);
            return { status: "success", message: "Orders fetched successfully", data: result };
        }
        catch (error) {
            return { status: "error", message: error.message || "An error occurred while fetching orders", data: null };
        }
    }
    async getOrderDetails(id) {
        try {
            const result = await this.ordersService.getOrderDetails(id);
            return { status: "success", message: 'Order details fetched successfully', data: result };
        }
        catch (error) {
            return { status: "error", message: error.message || 'An error occurred while fetching order details', data: null };
        }
    }
    async addBatchesToOrder(id, addBatchesDto) {
        try {
            const result = await this.ordersService.addBatchesToOrder(id, addBatchesDto.shippedBatches);
            return { status: "success", message: "Batches added to order successfully", data: result };
        }
        catch (error) {
            return { status: "error", message: error.message || "An error occurred while adding batches", data: null };
        }
    }
    async updateOrderBatches(id, updateBatchesDto) {
        try {
            const result = await this.ordersService.updateOrderBatches(id, updateBatchesDto.shippedBatches);
            return { status: "success", message: "Order batches updated successfully", data: result };
        }
        catch (error) {
            return { status: "error", message: error.message || "An error occurred while updating batches", data: null };
        }
    }
    async updateOrderStatus(id, updateDto) {
        try {
            const updatedOrder = await this.ordersService.updateOrderStatusWithBatches(id, updateDto.status, {
                trackingURL: updateDto.trackingURL,
                trackingNumber: updateDto.trackingNumber,
                courierName: updateDto.courierName,
                shippedBatches: updateDto.shippedBatches,
            });
            return { status: "success", message: "Order status updated successfully", data: updatedOrder };
        }
        catch (error) {
            return { status: "error", message: error.message || "An error occurred while updating order status", data: null };
        }
    }
    async getOrderDetailsByUser(id) {
        try {
            const result = await this.ordersService.getOrderDetails(id);
            return { status: "success", message: 'Order details fetched successfully', data: result };
        }
        catch (error) {
            return { status: "error", message: error.message || 'An error occurred while fetching order details', data: null };
        }
    }
    async getBatchSuggestions(body) {
        try {
            const result = await this.ordersService.getBatchSuggestions(body.productId, body.variantId, body.batchNo);
            return { status: "success", message: "Batch suggestions fetched successfully", data: result };
        }
        catch (error) {
            return { status: "error", message: error.message || "An error occurred while fetching batch suggestions", data: null };
        }
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)("user"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getUserOrders", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateOrderDto_dto_1.CreateOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)('status/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)("admin"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('fromDate')),
    __param(5, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getAllOrders", null);
__decorate([
    (0, common_1.Get)('admin/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderDetails", null);
__decorate([
    (0, common_1.Post)("admin/:id/batches"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AddBatchesToOrderDto_dto_1.AddBatchesToOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "addBatchesToOrder", null);
__decorate([
    (0, common_1.Put)("admin/:id/batches"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateBatchesDto_dto_1.UpdateBatchesDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateOrderBatches", null);
__decorate([
    (0, common_1.Put)("admin/:id/status"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateOrderStatusWithBatchesDto_dto_1.UpdateOrderStatusWithBatchesDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderDetailsByUser", null);
__decorate([
    (0, common_1.Post)("admin/batch-suggestions"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BatchSuggestionsDto_dto_1.BatchSuggestionsDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getBatchSuggestions", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)("orders"),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map