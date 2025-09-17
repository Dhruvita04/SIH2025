import { PrescriptionOrderStatus } from "@prisma/client";

export class CreatePrescriptionOrderDto {
  status: PrescriptionOrderStatus;
  rejectionReason?: string;
}