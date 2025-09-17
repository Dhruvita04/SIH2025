"use client"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axiosInstance from "@/utils/API"
import { PAYMENT_API } from "@/utils/API-ROUTES"
import { Loader2, CreditCard, User, Calendar, ExternalLink, Package, Banknote } from "lucide-react"
import BackButton from "@/components/ui/BackButton"
import { toast } from "react-hot-toast"

type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" | "CANCELLED"
type PaymentMethod = "CREDIT_CARD" | "DEBIT_CARD" | "UPI" | "NET_BANKING" | "WALLET"
type PaymentGateway = "CASHFREE" | "RAZORPAY" | "STRIPE" | "PAYU"

interface PaymentUser {
  id: string
  name: string
  email: string
  phone?: string | null
}

interface ShippingAddress {
  id: string
  userId: string
  name: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  default: boolean
  createdAt: string
  updatedAt: string
}

interface OrderProduct {
  id: string
  orderId: string
  productId: string
  variantId: string
  quantity: number
  originalPrice: number
  productDiscount: number
  price: number
  createdAt: string
  updatedAt: string
  product: {
    name: string
    images: string[]
  }
  variant: {
    name: string
  }
}

interface PaymentOrder {
  id: string
  orderId: string
  orderNumber: string
  prescriptionId: string
  paymentId?: string | null
  userId: string
  date: string
  status: string
  shippingAddressId: string
  couponId?: string | null
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
  shippingDetailsId?: string | null
  shippingAddress: ShippingAddress
  products: OrderProduct[]
}

interface Payment {
  id: string
  orderId: string
  userId: string
  method: PaymentMethod
  gateway: PaymentGateway
  status: PaymentStatus
  transactionId: string
  gatewayOrderId: string
  paymentSessionId: string
  gatewayReferenceId: string
  amount: number
  currency: string
  createdAt: string
  updatedAt: string
  callbackUrl?: string | null
  paymentDate?: string | null
  confirmationDate?: string | null
  errorMessage?: string | null
  isRefunded: boolean
  refundDate?: string | null
  user: PaymentUser
  order: PaymentOrder
  cashfreeDashboardUrl?: string
  availableStatuses?: PaymentStatus[]
}

// Define an interface for the error response data structure
interface ErrorResponseData {
  status: string
  message: string
  data: any
}

// Custom type guard to check if an error is an Axios-like error
function isAxiosErrorLike(error: any): error is { response?: { data?: ErrorResponseData } } {
  return error && typeof error === "object" && "response" in error
}

// Helper function to format dates safely
const formatDate = (dateValue: any): string => {
  if (!dateValue) return "N/A"

  try {
    // Handle ISO string dates
    if (typeof dateValue === "string") {
      const date = new Date(dateValue)
      if (!isNaN(date.getTime())) {
        return format(date, "dd MMM yyyy, hh:mm a")
      }
    }

    // Handle Date objects
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      return format(dateValue, "dd MMM yyyy, hh:mm a")
    }

    return "N/A"
  } catch (error) {
    console.error("Date formatting error:", error)
    return "N/A"
  }
}

// Helper function to get status color
const getStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-800 border-green-200"
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "FAILED":
      return "bg-red-100 text-red-800 border-red-200"
    case "REFUNDED":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "CANCELLED":
      return "bg-gray-100 text-gray-800 border-gray-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

// Helper function to get method icon
const getMethodIcon = (method: PaymentMethod) => {
  switch (method) {
    case "CREDIT_CARD":
    case "DEBIT_CARD":
      return <CreditCard className="h-4 w-4" />
    case "UPI":
      return <Banknote className="h-4 w-4" />
    case "NET_BANKING":
      return <Banknote className="h-4 w-4" />
    case "WALLET":
      return <Banknote className="h-4 w-4" />
    default:
      return <Banknote className="h-4 w-4" />
  }
}

export default function PaymentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [isStatusUpdateModalOpen, setIsStatusUpdateModalOpen] = useState(false)
  const [selectedStatusForUpdate, setSelectedStatusForUpdate] = useState<PaymentStatus | undefined>(undefined)
  const [refundReason, setRefundReason] = useState("")

  const {
    data: payment,
    isLoading,
    error,
  } = useQuery<Payment, Error>({
    queryKey: ["payment", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`${PAYMENT_API}/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })

  const updateStatusMutation = useMutation({
    mutationFn: async (data: {
      status: PaymentStatus
      refundReason?: string
    }) => {
      const response = await axiosInstance.put(`${PAYMENT_API}/${id}/status`, data)
      return response.data
    },
    onError: (err: any) => {
      const errorMessage =
        isAxiosErrorLike(err) && err.response?.data?.message
          ? err.response.data.message
          : "Failed to update payment status"
      toast.error(errorMessage)
    },
    onSuccess: () => {
      toast.success("Payment status updated successfully")
      setIsStatusUpdateModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ["payment", id] })
    },
  })

  const handleUpdateStatus = () => {
    if (!selectedStatusForUpdate) {
      toast.error("Please select a new status.")
      return
    }

    const payload: {
      status: PaymentStatus
      refundReason?: string
    } = { status: selectedStatusForUpdate }

    if (selectedStatusForUpdate === "REFUNDED") {
      if (!refundReason.trim()) {
        toast.error("Refund reason is required when status is REFUNDED.")
        return
      }
      payload.refundReason = refundReason
    }

    updateStatusMutation.mutate(payload)
  }

  const handleViewOrder = () => {
    navigate(`/admin/orders/view/${payment?.order.id}`)
  }

  const handleOpenCashfreeDashboard = () => {
    if (payment?.cashfreeDashboardUrl) {
      window.open(payment.cashfreeDashboardUrl, "_blank")
    }
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">Error loading payment details. Please try again.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    )
  }

  if (!payment) {
    return null
  }

  const availableStatuses: PaymentStatus[] = payment.availableStatuses || [
    "PENDING",
    "COMPLETED",
    "FAILED",
    "REFUNDED",
    "CANCELLED",
  ]

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <div className="flex-1 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Payment #{payment.transactionId}</h1>
          <Badge className={`text-lg ${getStatusColor(payment.status)}`}>{payment.status}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Amount:</span>
                <span className="text-lg font-bold">₹{payment.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Currency:</span>
                <span>{payment.currency}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Method:</span>
                <div className="flex items-center gap-2">
                  {getMethodIcon(payment.method)}
                  <span>{payment.method.replace(/_/g, " ")}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span>Gateway:</span>
                <span>{payment.gateway}</span>
              </div>
              <div className="flex justify-between">
                <span>Transaction ID:</span>
                <span className="font-mono text-sm">{payment.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span>Gateway Order ID:</span>
                <span className="font-mono text-sm">{payment.gatewayOrderId}</span>
              </div>
              {payment.gatewayReferenceId && (
                <div className="flex justify-between">
                  <span>Reference ID:</span>
                  <span className="font-mono text-sm">{payment.gatewayReferenceId}</span>
                </div>
              )}
              {payment.cashfreeDashboardUrl && (
                <div className="pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenCashfreeDashboard}
                    className="w-full bg-transparent"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View in Cashfree Dashboard
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Name:</span> {payment.user.name}
              </div>
              <div>
                <span className="font-medium">Email:</span> {payment.user.email}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {payment.user.phone || "Not provided"}
              </div>
              <div>
                <span className="font-medium">User ID:</span>
                <span className="font-mono text-sm ml-2">{payment.userId}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Order Number:</span>
                <span className="font-mono text-sm ml-2">#{payment.order.orderNumber}</span>
              </div>
              <div>
                <span className="font-medium">Order ID:</span>
                <span className="font-mono text-sm ml-2">{payment.order.orderId}</span>
              </div>
              <div>
                <span className="font-medium">Order Status:</span>
                <Badge variant="outline" className="ml-2">
                  {payment.order.status}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Order Date:</span>
                <span className="ml-2">{formatDate(payment.order.date)}</span>
              </div>
              <div>
                <span className="font-medium">Order Total:</span>
                <span className="ml-2 font-semibold">₹{payment.order.orderTotal.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t">
                <Button variant="outline" size="sm" onClick={handleViewOrder} className="w-full bg-transparent">
                  View Order Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Payment Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Created:</span>
                <span className="ml-2">{formatDate(payment.createdAt)}</span>
              </div>
              {payment.paymentDate && (
                <div>
                  <span className="font-medium">Payment Date:</span>
                  <span className="ml-2">{formatDate(payment.paymentDate)}</span>
                </div>
              )}
              {payment.confirmationDate && (
                <div>
                  <span className="font-medium">Confirmed:</span>
                  <span className="ml-2">{formatDate(payment.confirmationDate)}</span>
                </div>
              )}
              <div>
                <span className="font-medium">Last Updated:</span>
                <span className="ml-2">{formatDate(payment.updatedAt)}</span>
              </div>
              {payment.refundDate && (
                <div>
                  <span className="font-medium">Refund Date:</span>
                  <span className="ml-2">{formatDate(payment.refundDate)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Order Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{payment.order.subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-₹{payment.order.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Coupon Discount:</span>
                <span>-₹{payment.order.couponDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>₹{payment.order.shipping.toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>CGST:</span>
                <span>₹{payment.order.cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST:</span>
                <span>₹{payment.order.sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>IGST:</span>
                <span>₹{payment.order.igst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>₹{payment.order.orderTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Name:</span> {payment.order.shippingAddress.name}
            </div>
            <div>
              <span className="font-medium">Phone:</span> {payment.order.shippingAddress.phone}
            </div>
            <div>
              <span className="font-medium">Address:</span> {payment.order.shippingAddress.line1}
            </div>
            {payment.order.shippingAddress.line2 && <div>{payment.order.shippingAddress.line2}</div>}
            <div>
              {payment.order.shippingAddress.city}, {payment.order.shippingAddress.state}{" "}
              {payment.order.shippingAddress.postalCode}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Products */}
      <Card>
        <CardHeader>
          <CardTitle>Order Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payment.order.products.map((product) => (
              <div key={product.id} className="flex items-center space-x-4 border-b pb-4 last:border-b-0">
                <img
                  src={product.product.images[0] || "/placeholder.svg?height=80&width=80"}
                  alt={product.product.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="font-medium">{product.product.name}</div>
                  <div className="text-sm text-gray-500">{product.variant.name}</div>
                  <div className="text-sm">Quantity: {product.quantity}</div>
                  <div className="text-sm">Original Price: ₹{product.originalPrice.toFixed(2)}</div>
                  <div className="text-sm">Discount: ₹{product.productDiscount.toFixed(2)}</div>
                  <div className="text-sm font-semibold">
                    Final Price: ₹{product.price.toFixed(2)} × {product.quantity} = ₹
                    {(product.price * product.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-3">
              <div>
                <span className="font-medium">Payment Session ID:</span>
                <div className="font-mono text-sm mt-1 p-2 bg-gray-50 rounded break-all">
                  {payment.paymentSessionId}
                </div>
              </div>
              {payment.callbackUrl && (
                <div>
                  <span className="font-medium">Callback URL:</span>
                  <div className="font-mono text-sm mt-1 p-2 bg-gray-50 rounded break-all">{payment.callbackUrl}</div>
                </div>
              )}
              <div>
                <span className="font-medium">Refund Status:</span>
                <Badge variant={payment.isRefunded ? "destructive" : "secondary"} className="ml-2">
                  {payment.isRefunded ? "Refunded" : "Not Refunded"}
                </Badge>
              </div>
              {payment.errorMessage && (
                <div>
                  <span className="font-medium">Error Message:</span>
                  <div className="text-sm mt-1 p-2 bg-red-50 text-red-700 rounded">{payment.errorMessage}</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Update Modal */}
      <Dialog open={isStatusUpdateModalOpen} onOpenChange={setIsStatusUpdateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status-select">Select New Status</Label>
              <Select
                value={selectedStatusForUpdate}
                onValueChange={(value: PaymentStatus) => setSelectedStatusForUpdate(value)}
              >
                <SelectTrigger id="status-select">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses
                    .filter((status) => status !== payment.status)
                    .map((statusOption) => (
                      <SelectItem key={statusOption} value={statusOption}>
                        {statusOption.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStatusForUpdate === "REFUNDED" && (
              <div className="space-y-2">
                <Label htmlFor="refundReason">Refund Reason</Label>
                <Input
                  id="refundReason"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Enter refund reason"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateStatus} disabled={updateStatusMutation.isPending || !selectedStatusForUpdate}>
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
            <Button variant="outline" onClick={() => setIsStatusUpdateModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
