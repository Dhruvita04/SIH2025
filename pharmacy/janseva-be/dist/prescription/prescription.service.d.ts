import { PrismaService } from "../prisma/prisma.service";
import { ImageService } from "../utils/image.service";
import { CreatePrescriptionDto } from "./dto/create-prescription.dto";
import { Multer } from "multer";
import { CreatePrescriptionOrderDto } from "./dto/create-prescription-order.dto";
import { AddPrescriptionOrderToCartDto } from "./dto/order-to-cart.dto";
import { UpdatePrescriptionOrderStatusDto } from "./dto/update-prescription-order-status.dto";
export declare class PrescriptionService {
    private prisma;
    private imageService;
    constructor(prisma: PrismaService, imageService: ImageService);
    createPrescription(dto: CreatePrescriptionDto, file: Multer.File, currentObjectName: string): Promise<{
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
    }>;
    getAllPrescriptions(page?: number, limit?: number, search?: string, status?: string): Promise<{
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
    }>;
    getPrescriptionByUserId(userId: string, currentObjectName: string, page?: number, limit?: number, orderOnly?: boolean): Promise<{
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
    }>;
    getPrescriptionOrderFromPrescriptionId(prescriptionOrderId: string, currentObjectName: string): Promise<{
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
    }>;
    getPrescriptionById(id: string, currentObjectName: string): Promise<any>;
    updatePrescriptionOrderStatus(orderId: string, dto: UpdatePrescriptionOrderStatusDto): Promise<{
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
    }>;
    createPrescriptionOrder(prescriptionId: string, dto: CreatePrescriptionOrderDto): Promise<{
        createdAt: string;
        updatedAt: string;
        id: string;
        status: import(".prisma/client").$Enums.PrescriptionOrderStatus;
        userId: string;
        prescriptionId: string;
        rejectionReason: string | null;
    }>;
    createOrderWithPrescription(userId: string, prescriptionId: string): Promise<{
        createdAt: string;
        updatedAt: string;
        message: string;
        id: string;
        status: import(".prisma/client").$Enums.PrescriptionOrderStatus;
        userId: string;
        prescriptionId: string;
        rejectionReason: string | null;
    }>;
    addPrescriptionOrderToCart(prescriptionOrderId: string, dto: AddPrescriptionOrderToCartDto): Promise<{
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
    }>;
    getImageName(name: string): string;
}
