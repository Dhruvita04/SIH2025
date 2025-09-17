"use client"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axiosInstance from "@/utils/API"
import { ORDERS_API, PAYMENT_VERIFY_API } from "@/utils/API-ROUTES"
import { Loader2, Download, CreditCard, ExternalLink, Phone, Pencil, Plus } from "lucide-react"
import BackButton from "@/components/ui/BackButton"
import { toast } from "react-hot-toast"
import BatchDetailsModal from "@/components/orderdetail/BatchDetailsModal"
import StatusUpdateModal from "@/components/orderdetail/StatusUpdateModal"
import PrescriptionModal from "@/components/orderdetail/PrescriptionModal"

interface OrderProduct {
  id: string
  productId: string
  variantId: string
  quantity: number
  price: number
  originalPrice: number
  productDiscount: number
  product: {
    id: string
    name: string
    description: string
    images: string[]
    composition: string
    brand: {
      id: string
      name: string
    }
    category: {
      id: string
      name: string
    }
  }
  variant: {
    id: string
    name: string
    price: number
    stock: number
    units: number
    discount: number
    discountType: string
  }
}

interface Prescription {
  id: string
  prescriptionUrl: string
  patientName: string
  patientAge: number
  patientGender: string
  patientBloodGroup?: string | null
  patientHeight?: string | null
  patientWeight?: string | null
  doctorName: string
}

interface ShippingDetails {
  id: string
  orderId: string
  trackingURL: string
  trackingNumber: string
  courierName: string
  createdAt: string
  updatedAt: string
}

interface Payment {
  id: string
  orderId: string
  userId: string
  method: string
  gateway: string
  status: string
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
}

type OrderStatus = "PLACED" | "SHIPPED" | "IN_TRANSIT" | "DELIVERED" | "RETURNED" | "REFUNDED"

interface ShippedBatch {
  id: string
  orderId: string
  orderProductId: string
  batchNumber: string
  expiryDate: string
  quantity: number
  createdAt: string
}

interface BatchSuggestion {
  id: string
  batchNo: string
  expiryDate: string
}

interface Order {
  id: string
  orderId: string
  orderNumber: string
  date: string
  status: OrderStatus
  orderTotal: number
  subTotal: number
  discount: number
  shipping: number
  cgst: number
  sgst: number
  igst: number
  user: {
    id: string
    name: string
    email: string
    phone: string | null
  }
  shippingAddress: {
    id: string
    name: string
    phone: string
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
  }
  products: OrderProduct[]
  prescriptionDetails?: Prescription | null
  shippingDetails?: ShippingDetails | null
  payment?: Payment | null
  availableStatuses: OrderStatus[]
  pdf?: string | null
  statusHistory?: string
  shippedBatches?: ShippedBatch[]
  orderSummary?: {
    originalPrice: number
    productDiscount: number
    subtotal: number
    couponDiscount: number
    shipping: number
    total: number
    cgst: number
    sgst: number
    igst: number
  }
}

interface ErrorResponseData {
  message?: string
}

function isAxiosErrorLike(error: any): error is { response?: { data?: ErrorResponseData } } {
  return error && typeof error === "object" && "response" in error
}

function getPaymentStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case "COMPLETED":
      return "bg-green-100 text-green-800 border-green-200"
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "FAILED":
      return "bg-red-100 text-red-800 border-red-200"
    case "CANCELLED":
      return "bg-gray-100 text-gray-800 border-gray-200"
    default:
      return "bg-blue-100 text-blue-800 border-blue-200"
  }
}

export default function OrderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false)
  const [isStatusUpdateModalOpen, setIsStatusUpdateModalOpen] = useState(false)
  const [selectedStatusForUpdate, setSelectedStatusForUpdate] = useState<OrderStatus | undefined>(undefined)
  const [trackingURL, setTrackingURL] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [courierName, setCourierName] = useState("")
  const [paymentVerificationCalled, setPaymentVerificationCalled] = useState(false)
  const [batchDetails, setBatchDetails] = useState<{
    [orderProductId: string]: { batchNumber: string; quantity: number; expiryDate: string }[]
  }>({})
  const [isBatchManagementModalOpen, setIsBatchManagementModalOpen] = useState(false)
  const [batchManagementMode, setBatchManagementMode] = useState<"add" | "update">("add")
  const [batchSuggestions, setBatchSuggestions] = useState<{
    [key: string]: BatchSuggestion[]
  }>({})

  const {
    data: order,
    isLoading,
    error,
  } = useQuery<Order, Error>({
    queryKey: ["order", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`${ORDERS_API}/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })

  const verifyPayment = async (orderId: string) => {
    try {
      const response = await axiosInstance.get(`${PAYMENT_VERIFY_API}/${orderId}`)
      return response.data
    } catch (error) {
      console.error("Payment verification failed:", error)
      throw error
    }
  }

  const paymentVerificationMutation = useMutation({
    mutationFn: verifyPayment,
    onSuccess: (data) => {
      console.log("Payment verification successful:", data)
      toast.success("Payment verification completed")
      queryClient.invalidateQueries({ queryKey: ["order", id] })
    },
    onError: (error) => {
      console.error("Payment verification error:", error)
      const errorMessage =
        isAxiosErrorLike(error) && error.response?.data?.message
          ? error.response.data.message
          : "Payment verification failed"
      toast.error(errorMessage)
    },
  })

  useEffect(() => {
    if (
      order &&
      order.payment &&
      order.payment.status.toUpperCase() !== "COMPLETED" &&
      !paymentVerificationCalled &&
      !paymentVerificationMutation.isPending
    ) {
      setPaymentVerificationCalled(true)
      paymentVerificationMutation.mutate(order.id)
    }
  }, [order, paymentVerificationCalled, paymentVerificationMutation])

  useEffect(() => {
    if (order && isStatusUpdateModalOpen) {
      setTrackingURL(order.shippingDetails?.trackingURL || "")
      setTrackingNumber(order.shippingDetails?.trackingNumber || "")
      setCourierName(order.shippingDetails?.courierName || "")
    }
  }, [order, isStatusUpdateModalOpen])

  const handleOpenStatusUpdateModal = (status: OrderStatus) => {
    setSelectedStatusForUpdate(status)

    if (status === "SHIPPED") {
      if (order?.shippedBatches && order.shippedBatches.length > 0) {
        const existingBatchDetails: {
          [orderProductId: string]: { batchNumber: string; quantity: number; expiryDate: string }[]
        } = {}

        order.products.forEach((product) => {
          const productBatches = order.shippedBatches?.filter((batch) => batch.orderProductId === product.id) || []
          if (productBatches.length > 0) {
            existingBatchDetails[product.id] = productBatches.map((batch) => ({
              batchNumber: batch.batchNumber,
              quantity: batch.quantity,
              expiryDate: batch.expiryDate.split("T")[0],
            }))
          } else {
            existingBatchDetails[product.id] = [{ batchNumber: "", quantity: product.quantity, expiryDate: "" }]
          }
        })

        setBatchDetails(existingBatchDetails)
      } else {
        const initialBatchDetails: {
          [orderProductId: string]: { batchNumber: string; quantity: number; expiryDate: string }[]
        } = {}
        order?.products.forEach((product) => {
          initialBatchDetails[product.id] = [{ batchNumber: "", quantity: product.quantity, expiryDate: "" }]
        })
        setBatchDetails(initialBatchDetails)
      }
    }

    setIsStatusUpdateModalOpen(true)
  }

  const handleOpenBatchManagement = (mode: "add" | "update") => {
    setBatchManagementMode(mode)
    setIsBatchManagementModalOpen(true)

    if (mode === "update" && order?.shippedBatches) {
      const initialBatchDetails: {
        [orderProductId: string]: { batchNumber: string; quantity: number; expiryDate: string }[]
      } = {}

      order.products.forEach((product) => {
        const productBatches = order.shippedBatches?.filter((batch) => batch.orderProductId === product.id) || []
        initialBatchDetails[product.id] = productBatches.map((batch) => ({
          batchNumber: batch.batchNumber,
          quantity: batch.quantity,
          expiryDate: batch.expiryDate.split("T")[0],
        }))

        if (initialBatchDetails[product.id].length === 0) {
          initialBatchDetails[product.id] = [{ batchNumber: "", quantity: product.quantity, expiryDate: "" }]
        }
      })

      setBatchDetails(initialBatchDetails)
    } else {
      const initialBatchDetails: {
        [orderProductId: string]: { batchNumber: string; quantity: number; expiryDate: string }[]
      } = {}
      order?.products.forEach((product) => {
        initialBatchDetails[product.id] = [{ batchNumber: "", quantity: product.quantity, expiryDate: "" }]
      })
      setBatchDetails(initialBatchDetails)
    }
  }

  const handleDownloadPDF = () => {
    if (order?.pdf) {
      try {
        const byteCharacters = atob(order.pdf)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: "application/pdf" })

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `order-${order.orderNumber}-invoice.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error("PDF download failed:", error)
        toast.error("Failed to download PDF")
      }
    }
  }

  const handleViewPaymentDetails = () => {
    if (order?.payment?.id) {
      navigate(`/admin/payments/view/${order.payment.id}`)
    }
  }

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["order", id] })
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
        <p className="text-red-500 mb-4">Error loading order details. Please try again.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <div className="flex-1 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
          <Badge className="text-lg">{order.status}</Badge>
        </div>
      </div>

      {/* Payment Verification Status */}
      {order.payment && order.payment.status.toUpperCase() !== "COMPLETED" && paymentVerificationMutation.isPending && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
              <span className="text-yellow-800">Verifying payment status...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Buttons for Available Statuses */}
      {order.availableStatuses && order.availableStatuses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {order.availableStatuses.map((statusOption) => (
                <Button
                  key={statusOption}
                  onClick={() => handleOpenStatusUpdateModal(statusOption)}
                  variant={statusOption === order.status ? "secondary" : "default"}
                >
                  {statusOption.replace(/_/g, " ")}
                </Button>
              ))}
            </div>

            {order.status === "PLACED" && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Batch Management</h4>
                <div className="flex flex-wrap gap-2">
                  {!order.shippedBatches || order.shippedBatches.length === 0 ? (
                    <Button
                      onClick={() => handleOpenBatchManagement("add")}
                      variant="outline"
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Batches
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleOpenBatchManagement("update")}
                      variant="outline"
                      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Update Batches
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Order Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <span className="text-sm font-medium text-gray-600">Order ID (UUID)</span>
              <p className="font-mono text-sm bg-gray-100 px-3 py-2 rounded border break-all">{order.id}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-gray-600">Order ID</span>
              <p className="text-lg font-semibold text-gray-900 font-mono">{order.orderId}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-gray-600">Order Number</span>
              <p className="text-lg font-semibold text-gray-900">#{order.orderNumber}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-gray-600">Order Date</span>
              <p className="text-lg font-medium text-gray-900">{format(new Date(order.date), "dd MMM yyyy")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {order.orderSummary ? (
                <>
                  <div className="flex justify-between">
                    <span>Original Price:</span>
                    <span>₹{order.orderSummary.originalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Product Discount:</span>
                    <span>-₹{order.orderSummary.productDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{order.orderSummary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coupon Discount:</span>
                    <span>-₹{order.orderSummary.couponDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>₹{order.orderSummary.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CGST:</span>
                    <span>₹{order.orderSummary.cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST:</span>
                    <span>₹{order.orderSummary.sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IGST:</span>
                    <span>₹{order.orderSummary.igst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₹{order.orderSummary.total.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{order.subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>₹{order.discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>₹{order.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CGST:</span>
                    <span>₹{order.cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST:</span>
                    <span>₹{order.sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IGST:</span>
                    <span>₹{order.igst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₹{order.orderTotal.toFixed(2)}</span>
                  </div>
                </>
              )}
              {order.statusHistory && (
                <div className="pt-2 border-t">
                  <span className="text-sm font-medium">Status History:</span>
                  <p className="text-sm text-gray-600 mt-1">{order.statusHistory}</p>
                </div>
              )}
            </div>
            {order.pdf && (
              <div className="pt-4 border-t">
                <Button onClick={handleDownloadPDF} className="w-full bg-transparent" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Order PDF
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Details */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Name:</span> {order.user.name}
              </div>
              <div>
                <span className="font-medium">Email:</span> {order.user.email}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {order.user.phone || "Not provided"}
              </div>
              {order.user.phone && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => window.open(`tel:${order.user.phone}`, "_self")}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Customer
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Name:</span> {order.shippingAddress.name}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {order.shippingAddress.phone}
              </div>
              <div>
                <span className="font-medium">Address:</span> {order.shippingAddress.line1}
              </div>
              {order.shippingAddress.line2 && <div>{order.shippingAddress.line2}</div>}
              <div>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Tracking Details */}
        {order.shippingDetails && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Shipping Tracking Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Tracking Number:</span> {order.shippingDetails.trackingNumber}
                </div>
                <div>
                  <span className="font-medium">Courier Name:</span> {order.shippingDetails.courierName}
                </div>
                <div>
                  <span className="font-medium">Tracking URL:</span>{" "}
                  <a
                    href={order.shippingDetails.trackingURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {order.shippingDetails.trackingURL}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Products */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.products.map((product: OrderProduct) => (
              <div key={product.id} className="flex items-center space-x-4 border-b pb-4">
                <img
                  src={product.product.images[0] || "/placeholder.svg?height=80&width=80"}
                  alt={product.product.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="font-medium">{product.product.name}</div>
                  <div className="text-sm text-gray-500">{product.variant.name}</div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Brand:</span> {product.product.brand.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Category:</span> {product.product.category.name}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Original Price:</span> ₹{product.originalPrice.toFixed(2)}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Discount:</span> ₹{product.productDiscount.toFixed(2)}
                  </div>
                  <div className="text-sm">
                    Quantity: {product.quantity} × ₹{product.price.toFixed(2)} = ₹
                    {(product.quantity * product.price).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Existing Batches Display */}
      {order.shippedBatches && order.shippedBatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Batch Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.products.map((product) => {
                const productBatches =
                  order.shippedBatches?.filter((batch) => batch.orderProductId === product.id) || []

                if (productBatches.length === 0) return null

                return (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <img
                        src={product.product.images[0] || "/placeholder.svg?height=60&width=60"}
                        alt={product.product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-medium">{product.product.name}</h4>
                        <p className="text-sm text-gray-500">{product.variant.name}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {productBatches.map((batch) => (
                        <div key={batch.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="space-y-2">
                            <div>
                              <span className="text-xs font-medium text-gray-600">Batch Number:</span>
                              <p className="text-sm font-mono">{batch.batchNumber}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-600">Quantity:</span>
                              <p className="text-sm">{batch.quantity}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-600">Expiry Date:</span>
                              <p className="text-sm">{format(new Date(batch.expiryDate), "dd MMM yyyy")}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prescription Details */}
      {order.prescriptionDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Prescription Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Patient Name:</span> {order.prescriptionDetails.patientName}
                </div>
                <div>
                  <span className="font-medium">Age:</span> {order.prescriptionDetails.patientAge}
                </div>
                <div>
                  <span className="font-medium">Gender:</span> {order.prescriptionDetails.patientGender}
                </div>
                {order.prescriptionDetails.patientBloodGroup && (
                  <div>
                    <span className="font-medium">Blood Group:</span> {order.prescriptionDetails.patientBloodGroup}
                  </div>
                )}
                {order.prescriptionDetails.patientHeight && (
                  <div>
                    <span className="font-medium">Height:</span> {order.prescriptionDetails.patientHeight}
                  </div>
                )}
                {order.prescriptionDetails.patientWeight && (
                  <div>
                    <span className="font-medium">Weight:</span> {order.prescriptionDetails.patientWeight}
                  </div>
                )}
                <div>
                  <span className="font-medium">Doctor:</span> {order.prescriptionDetails.doctorName}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <img
                  src={order.prescriptionDetails.prescriptionUrl || "/placeholder.svg?height=300&width=200"}
                  alt="Prescription"
                  className="w-full max-w-md rounded-lg shadow-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setIsPrescriptionModalOpen(true)}
                />
                <p className="text-sm text-gray-500 mt-2">Click to view full size</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Details */}
      {order.payment && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="h-6 w-6 text-blue-600" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Badge className={`${getPaymentStatusColor(order.payment.status)} px-3 py-1 text-sm font-medium`}>
                    {order.payment.status}
                  </Badge>
                  {order.payment.isRefunded && (
                    <Badge className="bg-orange-100 text-orange-800 border-orange-200 px-3 py-1 text-sm">
                      Refunded
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">₹{order.payment.amount.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">{order.payment.currency}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Payment Method</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Method:</span>
                      <span className="font-medium capitalize bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                        {order.payment.method.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Gateway:</span>
                      <span className="font-medium bg-green-50 text-green-700 px-2 py-1 rounded text-sm">
                        {order.payment.gateway}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Transaction Details</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 text-sm block">Transaction ID:</span>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mt-1 block break-all">
                        {order.payment.transactionId}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm block">Gateway Order ID:</span>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mt-1 block break-all">
                        {order.payment.gatewayOrderId}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                <div className="space-y-3">
                  {order.payment.gatewayReferenceId && (
                    <div>
                      <span className="text-gray-600 text-sm block">Gateway Reference ID:</span>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mt-1 block break-all">
                        {order.payment.gatewayReferenceId}
                      </span>
                    </div>
                  )}
                  {order.payment.paymentSessionId && (
                    <div>
                      <span className="text-gray-600 text-sm block">Payment Session ID:</span>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mt-1 block break-all">
                        {order.payment.paymentSessionId}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-sm font-medium">
                      {format(new Date(order.payment.createdAt), "dd MMM yyyy, hh:mm a")}
                    </span>
                  </div>
                  {order.payment.paymentDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Date:</span>
                      <span className="text-sm font-medium text-green-600">
                        {format(new Date(order.payment.paymentDate), "dd MMM yyyy, hh:mm a")}
                      </span>
                    </div>
                  )}
                  {order.payment.confirmationDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Confirmed:</span>
                      <span className="text-sm font-medium text-green-600">
                        {format(new Date(order.payment.confirmationDate), "dd MMM yyyy, hh:mm a")}
                      </span>
                    </div>
                  )}
                  {order.payment.refundDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Refund Date:</span>
                      <span className="text-sm font-medium text-orange-600">
                        {format(new Date(order.payment.refundDate), "dd MMM yyyy, hh:mm a")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {order.payment.errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <div className="text-red-600 font-medium text-sm">Error Message:</div>
                  </div>
                  <div className="text-red-700 text-sm mt-1 break-words">{order.payment.errorMessage}</div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handleViewPaymentDetails}
                  className="w-full bg-white hover:bg-gray-50 border-gray-300 text-gray-700 font-medium"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Complete Payment Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <PrescriptionModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        prescriptionDetails={order.prescriptionDetails}
        orderNumber={order.orderNumber}
      />

      <StatusUpdateModal
        isOpen={isStatusUpdateModalOpen}
        onClose={() => setIsStatusUpdateModalOpen(false)}
        order={order}
        selectedStatus={selectedStatusForUpdate}
        setSelectedStatus={setSelectedStatusForUpdate}
        trackingURL={trackingURL}
        setTrackingURL={setTrackingURL}
        trackingNumber={trackingNumber}
        setTrackingNumber={setTrackingNumber}
        courierName={courierName}
        setCourierName={setCourierName}
        batchDetails={batchDetails}
        setBatchDetails={setBatchDetails}
        batchSuggestions={batchSuggestions}
        setBatchSuggestions={setBatchSuggestions}
        onSuccess={handleSuccess}
      />

      <BatchDetailsModal
        isOpen={isBatchManagementModalOpen}
        onClose={() => setIsBatchManagementModalOpen(false)}
        mode={batchManagementMode}
        order={order}
        batchDetails={batchDetails}
        setBatchDetails={setBatchDetails}
        batchSuggestions={batchSuggestions}
        setBatchSuggestions={setBatchSuggestions}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
