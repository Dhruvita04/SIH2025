import { IsEnum, IsOptional, IsString } from "class-validator"
import { PrescriptionOrderStatus } from "@prisma/client"

export class UpdatePrescriptionOrderStatusDto {
  @IsEnum(PrescriptionOrderStatus)
  status: PrescriptionOrderStatus

  @IsOptional()
  @IsString()
  rejectionReason?: string
}
  