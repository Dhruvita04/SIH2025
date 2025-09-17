import { Separator } from "@/components/ui/separator"
import { TruckIcon } from "@heroicons/react/24/outline"
import { Link } from "react-router-dom"

interface Order {
  id: string
  orderId: string
  orderNumber: string
  prescriptionId: string
  userId: string
  date: string
  status: string
  shippingAddressId: string
  couponId: string | null
  subTotal: number
  discount: number
  couponDiscount: number
  shipping: number
  cgst: number
  sgst: number
  igst: number
  orderTotal: number
  createdAt: string
  updatedAt: string
  shippingDetailsId: string | null
  user: {
    id: string
    name: string
    email: string
    phone: string | null
  }
  shippingAddress: {
    id: string
    userId: string
    name: string
    phone: string
    line1: string
    line2: string
    city: string
    state: string
    postalCode: string
    default: boolean
    createdAt: string
    updatedAt: string
  }
  payment: {
    id: string
    method: string
    gateway: string
    status: string
    transactionId: string | null
    gatewayOrderId: string
    paymentSessionId: string
    amount: number
    currency: string
    paymentDate: string | null
    confirmationDate: string | null
    errorMessage: string | null
    isRefunded: boolean
    refundDate: string | null
  }
  estimatedDeliveryDate: string
  userActions: {
    canCancel: boolean
    canReturn: boolean
    canRetryPayment: boolean
  }
}

function OrderCard({ order }: { order: Order }) {
  const formatDate = (dateString: string | Date | undefined) => {
    if (dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    }
    return "-"
  }

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case "UPI":
        return "UPI"
      case "CREDIT_CARD":
        return "Credit Card"
      case "DEBIT_CARD":
        return "Debit Card"
      case "NET_BANKING":
        return "Net Banking"
      case "CASH_ON_DELIVERY":
        return "Cash on Delivery"
      default:
        return method || "N/A"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLACED":
        return "bg-blue-100 text-blue-700"
      case "SHIPPED":
        return "bg-purple-100 text-purple-700"
      case "IN_TRANSIT":
        return "bg-yellow-100 text-yellow-700"
      case "DELIVERED":
        return "bg-green-100 text-green-700"
      case "CANCELLED":
        return "bg-red-100 text-red-700"
      case "RETURNED":
        return "bg-orange-100 text-orange-700"
      case "REFUNDED":
        return "bg-gray-100 text-gray-700"
      case "PAYMENT_FAILED":
        return "bg-red-100 text-red-700"
      case "PAYMENT_PENDING":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const formattedOrderDate = formatDate(order.date)
  const formattedEstimatedDeliveryDate = formatDate(order.estimatedDeliveryDate)
  const paymentMethod = getPaymentMethodDisplay(order.payment?.method || "")

  return (
    <Link to={`/orders/${order.id}`} className="block">
      <div className="p-4 rounded-lg border border-gray-200 hover:border-primary transition-colors duration-200">
        {/* Order Header Start */}
        <div className="w-full flex flex-col space-y-4 items-center md:flex-row md:items-start">
          <div className="w-full flex justify-between items-center md:flex-col md:items-start">
            <span>
              <p className="text-gray-700">
                Order ID: <span className="font-semibold text-gray-900">#{order.orderId}</span>
              </p>
              <span className={`inline-flex items-center px-[6px] py-[3px] rounded-md ${getStatusColor(order.status)}`}>
                <TruckIcon className="w-3 h-3 mr-1" />
                <p className="text-xs font-bold">{order.status.replace("_", " ")}</p>
              </span>
            </span>
          </div>

          {/* Action Buttons Start */}
          <div className="flex items-center justify-end space-x-2 w-full max-w-[348px]">
            <Link
              to={`/orders/${order.id}`}
              className="px-3 py-2 md:px-2 md:py-1 lg:px-3 lg:py-2 text-sm leading-5 rounded-md border border-gray-200 whitespace-nowrap hover:bg-gray-50 transition-colors"
            >
              Order Details
            </Link>
          </div>
          {/* Action Buttons End */}
        </div>
        {/* Order Header End */}

        <Separator className="my-6" />

        {/* Details Row Start */}
        <div className="w-full flex items-center flex-wrap mb-6 gap-y-2 md:gap-x-6">
          <p>
            <span className="font-semibold text-gray-900 mr-1">Order Date:</span>
            {formattedOrderDate}
          </p>
          <p>
            <span className="font-semibold text-gray-900 mr-1">Email:</span>
            {order.user.email}
          </p>
          <p>
            <span className="font-semibold text-gray-900 mr-1">Payment Method:</span>
            {paymentMethod}
          </p>
          <p>
            <span className="font-semibold text-gray-900 mr-1">Total:</span>₹{order.orderTotal}
          </p>
        </div>
        {/* Details Row End */}

        {/* Delivery Details Start */}
        {order.status !== "PAYMENT_FAILED" && order.status !== "PAYMENT_PENDING" && order.status !== "CANCELLED" && (
          <div className="w-full flex items-center flex-wrap px-3 py-2 rounded-md bg-blue-100 text-primary">
            <TruckIcon className="w-5 h-5 mr-2" />
            <p className="text-sm">
              Expected delivery on <b>{formattedEstimatedDeliveryDate}</b>
            </p>
          </div>
        )}
        {/* Delivery Details End */}
      </div>
    </Link>
  )
}

export default OrderCard
