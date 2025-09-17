import { IsString, IsEnum, IsNumber, IsOptional, IsArray, IsBoolean, IsDateString, IsDecimal, Min, MaxLength } from 'class-validator';
import { CouponType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateCouponDto {
  @IsString()
  @MaxLength(20)
  code: string;

  @IsEnum(CouponType)
  discountType: CouponType;

  @IsDecimal({ decimal_digits: '2' })
  @Type(() => Number)
  discountValue: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxUses?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Type(() => Number)
  minPurchaseAmount?: number;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  userIds?: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  productIds?: number[];
} 