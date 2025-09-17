export class AddPrescriptionOrderToCartDto {
  products: {
    product_id: string;
    variant_id: string;
    quantity: number;
  }[];
}