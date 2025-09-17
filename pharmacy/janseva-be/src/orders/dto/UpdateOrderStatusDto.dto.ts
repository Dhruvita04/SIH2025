import { IsEnum, IsString, IsOptional } from "class-validator"
import { OrderStatus } from "@prisma/client"

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus

  @IsOptional()
  @IsString()
  trackingURL?: string

  @IsOptional()
  @IsString()
  trackingNumber?: string

  @IsOptional()
  @IsString()
  courierName?: string
}
