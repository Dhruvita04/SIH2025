import type { OrderStatus } from "@prisma/client"
import type { ShippedBatchDto } from "./ShippedBatchDto.dto"

export class UpdateOrderStatusWithBatchesDto {
  status: OrderStatus
  trackingURL?: string
  trackingNumber?: string
  courierName?: string
  shippedBatches?: ShippedBatchDto[]
}
