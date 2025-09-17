export class CreateOrderDto {
  userId: string
  addressId: string
  couponId?: string
  prescriptionId?: string
  paymentId?: string
  gatewayOrderId?: string // Add this for Cashfree order ID
  paymentSessionId?: string // Add this for payment session ID
  subTotal: number
  discount: number
  shipping: number
  orderTotal: number
  items: {
    productId: string
    variantId: string
    quantity: number
    price: number
  }[]
}
