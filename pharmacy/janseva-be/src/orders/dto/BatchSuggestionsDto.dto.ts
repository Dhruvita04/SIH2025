import { IsString, IsOptional } from "class-validator"

export class BatchSuggestionsDto {
  @IsString()
  productId: string

  @IsString()
  variantId: string

  @IsOptional()
  @IsString()
  batchNo?: string
}
