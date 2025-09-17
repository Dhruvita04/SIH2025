import type { ShippedBatchDto } from "./ShippedBatchDto.dto"

export class AddBatchesToOrderDto {
  shippedBatches: ShippedBatchDto[]
}
