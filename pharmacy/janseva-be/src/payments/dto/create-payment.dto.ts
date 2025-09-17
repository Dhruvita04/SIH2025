import { IsNumber, IsString, IsArray, ValidateNested, IsOptional } from "class-validator"
import { Type } from "class-transformer"

class OrderItemDto {
  @IsString()
  productId: string

  @IsString()
  variantId: string

  @IsNumber()
  quantity: number

  @IsNumber()
  price: number
}

export class CreatePaymentDto {
  @IsString()
  addressId: string

  @IsOptional()
  @IsString()
  couponId?: string

  @IsOptional()
  @IsString()
  prescriptionId?: string

  @IsNumber()
  subTotal: number

  @IsNumber()
  discount: number

  @IsNumber()
  shipping: number

  @IsNumber()
  orderTotal: number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[]
}
