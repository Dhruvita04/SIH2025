import { IsString } from "class-validator"

export class RetryPaymentDto {
  @IsString()
  orderId: string
}
