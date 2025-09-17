import { PrescriptionOrderStatus } from "@prisma/client";
export declare class CreatePrescriptionOrderDto {
    status: PrescriptionOrderStatus;
    rejectionReason?: string;
}
