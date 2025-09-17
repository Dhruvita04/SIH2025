import { PrescriptionOrderStatus } from "@prisma/client";
export declare class UpdatePrescriptionOrderStatusDto {
    status: PrescriptionOrderStatus;
    rejectionReason?: string;
}
