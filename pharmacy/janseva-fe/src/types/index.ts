export enum OrderStatus {
    PLACED = "PLACED",
    SHIPPED = "SHIPPED",
    IN_TRANSIT = "IN_TRANSIT",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    RETURNED = "RETURNED",
    REFUNDED = "REFUNDED",
    PAYMENT_PENDING = "PAYMENT_PENDING",
    PAYMENT_FAILED = "PAYMENT_FAILED",
}

export enum OrderStatusColor {
    PLACED = "bg-gray-300",
    SHIPPED = "bg-blue-300",
    IN_TRANSIT = "bg-yellow-300",
    DELIVERED = "bg-green-300",
    CANCELLED = "bg-red-300",
    RETURNED = "bg-orange-300",
    REFUNDED = "bg-purple-300",
}

export interface Address {
    id: string
    userId?: string
    name: string
    phone: string
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    default: boolean
    createdAt: Date
    updatedAt: Date
}

export interface OrderUser {
    id: string
    name: string
    email: string
    phone: string
}

export interface Order {
    id: string
    orderNumber: number
    orderId: string
    prescriptionId?: string
    paymentId?: string
    userId: string
    date: Date
    status: OrderStatus
    addressId: string
    couponId?: string
    subTotal: number
    discount: number
    shipping: number
    cgst: number
    sgst: number
    igst: number
    user: OrderUser
    orderTotal: number
    createdAt: Date
    updatedAt: Date
    shippingDetailsId?: string
    Address: Address
    products: OrderProduct[]
    payment?: Payment
    estimatedDeliveryDate?: Date | string
}

export interface OrderProduct {
    id: string
    orderId: string
    productId: string
    variantId: string
    quantity: number
    price: number
    createdAt: Date
    updatedAt: Date
    product: Product
    variant: ProductVariant
}

export interface Payment {
    id: string
    orderId: string
    userId: string
    method: PaymentMethod
    gateway: PaymentGateway
    status: PaymentStatus
    transactionId?: string
    amount: number
    currency: string
    createdAt: Date
    updatedAt: Date
    callbackUrl?: string
    paymentDate?: Date
    confirmationDate?: Date
    errorMessage?: string
    isRefunded: boolean
    refundDate?: Date
}

export enum PaymentMethod {
    CREDIT_CARD = "CREDIT_CARD",
    DEBIT_CARD = "DEBIT_CARD",
    UPI = "UPI",
    NET_BANKING = "NET_BANKING",
    CASH_ON_DELIVERY = "CASH_ON_DELIVERY"
}

export enum PaymentStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}

export enum PaymentGateway {
    RAZORPAY = "RAZORPAY"
}

export interface Product {
    id: string
    name: string
    description?: string
    images: string[]
    categoryId: string
    brandId: string
    slug: string
    tags: string[]
    variants: ProductVariant[]
}

export interface ProductVariant {
    id: string
    productId: string
    name: string
    price: number
    stock: number
    units: number
    discount: number
    discountType: string
}

export interface SubPoint {
    label: string;
    text: string;
}

export interface Paragraph {
    id?: string;
    text: string;
    subPoints?: SubPoint[];
}

export interface Section {
    title: string;
    content: Paragraph[];
}


export interface PrivacyPolicyData {
    title: string;
    lastUpdated: string;
    sections: Section[];
}

