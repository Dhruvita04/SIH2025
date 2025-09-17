import { IsArray } from "class-validator"

export class GetCartDataDto {
  @IsArray()
  data: {
    productId: string
    quantity: number
    variantId: string
  }[]
}
