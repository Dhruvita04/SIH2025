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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionController = void 0;
const common_1 = require("@nestjs/common");
const prescription_service_1 = require("./prescription.service");
const create_prescription_dto_1 = require("./dto/create-prescription.dto");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const create_prescription_order_dto_1 = require("./dto/create-prescription-order.dto");
const order_to_cart_dto_1 = require("./dto/order-to-cart.dto");
const create_order_with_prescription_dto_1 = require("./dto/create-order-with-prescription.dto");
const update_prescription_order_status_dto_1 = require("./dto/update-prescription-order-status.dto");
let PrescriptionController = class PrescriptionController {
    constructor(prescriptionService) {
        this.prescriptionService = prescriptionService;
        this.currentObjectName = "Prescription";
    }
    async create(dto, file) {
        try {
            if (!file) {
                throw new Error("No file uploaded");
            }
            const response = await this.prescriptionService.createPrescription(dto, file, this.currentObjectName);
            return {
                status: "success",
                message: "Prescription created successfully",
                data: response,
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
    async getAll(page = '1', limit = '10', search, status) {
        try {
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const result = await this.prescriptionService.getAllPrescriptions(pageNum, limitNum, search, status);
            return {
                status: "success",
                message: "Prescriptions retrieved successfully",
                data: result,
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
    async getById(id) {
        try {
            const prescription = await this.prescriptionService.getPrescriptionById(id, this.currentObjectName);
            return {
                status: 'success',
                message: 'Prescription retrieved successfully',
                data: prescription
            };
        }
        catch (error) {
            if (error.message && error.message.includes('exp')) {
                return {
                    status: 'error',
                    message: 'Prescription image link has expired. Please refresh the page.',
                    data: null,
                    errorCode: 'JWT_EXPIRED'
                };
            }
            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    }
    async getOrderStatus(orderId) {
        try {
            const prescription = await this.prescriptionService.getPrescriptionOrderFromPrescriptionId(orderId, this.currentObjectName);
            return {
                status: 'success',
                message: 'Prescription Order retrieved successfully',
                data: prescription
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    }
    async updateOrderStatus(orderId, dto) {
        try {
            const updatedOrder = await this.prescriptionService.updatePrescriptionOrderStatus(orderId, dto);
            return {
                status: "success",
                message: "Prescription order status updated successfully",
                data: updatedOrder,
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
    async getSingleById(id) {
        try {
            const prescription = await this.prescriptionService.getPrescriptionById(id, this.currentObjectName);
            return {
                status: 'success',
                message: 'Prescription retrieved successfully',
                data: prescription
            };
        }
        catch (error) {
            if (error.message && error.message.includes('exp')) {
                return {
                    status: 'error',
                    message: 'Prescription image link has expired. Please refresh the page.',
                    data: null,
                    errorCode: 'JWT_EXPIRED'
                };
            }
            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    }
    async getByUserId(id, page = '1', limit = '10', order = 'false') {
        try {
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const orderOnly = order === 'true';
            const result = await this.prescriptionService.getPrescriptionByUserId(id, this.currentObjectName, pageNum, limitNum, orderOnly);
            return {
                status: 'success',
                message: 'Prescriptions retrieved successfully',
                data: result
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    }
    async createOrder(id, dto) {
        try {
            const prescriptionOrder = await this.prescriptionService.createPrescriptionOrder(id, dto);
            return {
                status: "success",
                message: "Prescription order created successfully",
                data: prescriptionOrder,
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
    async createOrderWithPrescription(dto) {
        try {
            const prescriptionOrder = await this.prescriptionService.createOrderWithPrescription(dto.userId, dto.prescriptionId);
            return {
                status: "success",
                message: "Prescription order created successfully",
                data: prescriptionOrder,
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
    async addOrderToCart(prescriptionOrderId, dto) {
        try {
            const prescriptionOrder = await this.prescriptionService.addPrescriptionOrderToCart(prescriptionOrderId, dto);
            return {
                status: "success",
                message: "Prescription order retrieved successfully",
                data: prescriptionOrder,
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
};
exports.PrescriptionController = PrescriptionController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("upload"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("prescription")),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_prescription_dto_1.CreatePrescriptionDto, typeof (_a = typeof multer_1.Multer !== "undefined" && multer_1.Multer.File) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], PrescriptionController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], PrescriptionController.prototype, "getAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PrescriptionController.prototype, "getById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('order-status/:orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PrescriptionController.prototype, "getOrderStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('order-status/:orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_prescription_order_status_dto_1.UpdatePrescriptionOrderStatusDto]),
    __metadata("design:returntype", Promise)
], PrescriptionController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('single/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PrescriptionController.prototype, "getSingleById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('user/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('order')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], PrescriptionController.prototype, "getByUserId", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("order-status/:id"),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_prescription_order_dto_1.CreatePrescriptionOrderDto]),
    __metadata("design:returntype", Promise)
], PrescriptionController.prototype, "createOrder", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("create-order"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_with_prescription_dto_1.CreateOrderWithPrescriptionDto]),
    __metadata("design:returntype", Promise)
], PrescriptionController.prototype, "createOrderWithPrescription", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("order/:id"),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, order_to_cart_dto_1.AddPrescriptionOrderToCartDto]),
    __metadata("design:returntype", Promise)
], PrescriptionController.prototype, "addOrderToCart", null);
exports.PrescriptionController = PrescriptionController = __decorate([
    (0, common_1.Controller)("prescription"),
    __metadata("design:paramtypes", [prescription_service_1.PrescriptionService])
], PrescriptionController);
//# sourceMappingURL=prescription.controller.js.map