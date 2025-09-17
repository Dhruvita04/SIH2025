import { PrescriptionService } from "./prescription.service";
import { CreatePrescriptionDto } from "./dto/create-prescription.dto";
import { Multer } from "multer";
import { CreatePrescriptionOrderDto } from "./dto/create-prescription-order.dto";
import { AddPrescriptionOrderToCartDto } from "./dto/order-to-cart.dto";
import { CreateOrderWithPrescriptionDto } from "./dto/create-order-with-prescription.dto";
import { UpdatePrescriptionOrderStatusDto } from "./dto/update-prescription-order-status.dto";
export declare class PrescriptionController {
    private readonly prescriptionService;
    private currentObjectName;
    constructor(prescriptionService: PrescriptionService);
    create(dto: CreatePrescriptionDto, file: Multer.File): Promise<{
        status: string;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            patientAge: number;
            patientBloodGroup: string | null;
            patientGender: string;
            patientHeight: number | null;
            patientName: string;
            patientWeight: number | null;
            prescriptionUrl: string;
            doctorName: string;
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    getAll(page?: string, limit?: string, search?: string, status?: string): Promise<{
        status: string;
        message: string;
        data: {
            data: {
                id: string;
                prescriptionId: string;
                userId: string;
                patientName: string;
                patientAge: number;
                patientGender: string;
                patientWeight: number;
                patientHeight: number;
                patientBloodGroup: string;
                doctorName: string;
                prescriptionUrl: string;
                createdAt: string;
                updatedAt: string;
                status: import(".prisma/client").$Enums.PrescriptionOrderStatus;
                orderCreatedAt: string;
                rejectionReason: string;
                user: {
                    name: string;
                    id: string;
                    email: string;
                    phone: string;
                };
            }[];
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
    getById(id: string): Promise<{
        status: string;
        message: string;
        data: any;
        errorCode?: undefined;
    } | {
        status: string;
        message: string;
        data: any;
        errorCode: string;
    } | {
        status: string;
        message: any;
        data: any;
        errorCode?: undefined;
    }>;
    getOrderStatus(orderId: string): Promise<{
        status: string;
        message: string;
        data: {
            status: import(".prisma/client").$Enums.PrescriptionOrderStatus;
            message: string;
            data: {
                createdAt: string;
                updatedAt: string;
                prescription: {
                    id: string;
                    patientName: string;
                    patientAge: number;
                    patientGender: string;
                    patientWeight: number;
                    patientHeight: number;
                    patientBloodGroup: string;
                    doctorName: string;
                    prescriptionUrl: string;
                    createdAt: string;
                    updatedAt: string;
                };
                user: {
                    name: string;
                    id: string;
                    email: string;
                    phone: string;
                };
                id: string;
                status: import(".prisma/client").$Enums.PrescriptionOrderStatus;
                userId: string;
                prescriptionId: string;
                rejectionReason: string | null;
            };
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    updateOrderStatus(orderId: string, dto: UpdatePrescriptionOrderStatusDto): Promise<{
        status: string;
        message: string;
        data: {
            id: string;
            prescriptionId: string;
            userId: string;
            status: import(".prisma/client").$Enums.PrescriptionOrderStatus;
            rejectionReason: string;
            createdAt: string;
            updatedAt: string;
            user: {
                name: string;
                id: string;
                email: string;
                phone: string;
            };
            prescription: {
                id: string;
                patientName: string;
                patientAge: number;
                patientGender: string;
                patientWeight: number;
                patientHeight: number;
                patientBloodGroup: string;
                doctorName: string;
                prescriptionUrl: string;
                createdAt: string;
                updatedAt: string;
            };
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    getSingleById(id: string): Promise<{
        status: string;
        message: string;
        data: any;
        errorCode?: undefined;
    } | {
        status: string;
        message: string;
        data: any;
        errorCode: string;
    } | {
        status: string;
        message: any;
        data: any;
        errorCode?: undefined;
    }>;
    getByUserId(id: string, page?: string, limit?: string, order?: string): Promise<{
        status: string;
        message: string;
        data: {
            data: {
                createdAt: string;
                updatedAt: string;
                prescription: {
                    url: any;
                    path: string;
                    hasError: boolean;
                    errorMessage: any;
                };
                status: import(".prisma/client").$Enums.PrescriptionOrderStatus;
                id: string;
                userId: string;
                patientAge: number;
                patientBloodGroup: string | null;
                patientGender: string;
                patientHeight: number | null;
                patientName: string;
                patientWeight: number | null;
                prescriptionUrl: string;
                doctorName: string;
            }[];
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
    createOrder(id: string, dto: CreatePrescriptionOrderDto): Promise<{
        status: string;
        message: string;
        data: {
            createdAt: string;
            updatedAt: string;
            id: string;
            status: import(".prisma/client").$Enums.PrescriptionOrderStatus;
            userId: string;
            prescriptionId: string;
            rejectionReason: string | null;
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    createOrderWithPrescription(dto: CreateOrderWithPrescriptionDto): Promise<{
        status: string;
        message: string;
        data: {
            createdAt: string;
            updatedAt: string;
            message: string;
            id: string;
            status: import(".prisma/client").$Enums.PrescriptionOrderStatus;
            userId: string;
            prescriptionId: string;
            rejectionReason: string | null;
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    addOrderToCart(prescriptionOrderId: string, dto: AddPrescriptionOrderToCartDto): Promise<{
        status: string;
        message: string;
        data: {
            message: string;
            data: {
                cart: {
                    id: string;
                    userId: string;
                    prescriptionId: string;
                    prescriptionOrderId: string;
                    isPrescriptionCart: boolean;
                    createdAt: string;
                    updatedAt: string;
                };
                cartItems: any[];
                prescriptionOrder: {
                    id: string;
                    status: import(".prisma/client").$Enums.PrescriptionOrderStatus;
                    updatedAt: string;
                };
            };
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
}
