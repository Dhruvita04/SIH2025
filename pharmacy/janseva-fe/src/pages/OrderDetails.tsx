"use client"

import { useParams, Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosInstance from "@/utils/API"
import { ORDERS } from "@/CONFIG/api-routes"
import { OrderStatus } from "@/types"
import {
  Loader2Icon,
  Download,
  MessageCircle,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  RotateCcw,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  User,
  ExternalLink,
  ShoppingBag,
  FileText,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { formatDate } from "@/utils/formatters"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import toast from "react-hot-toast"

function OrderDetails() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [cancellationReason, setCancellationReason] = useState("")
  const [isPrescriptionDialogOpen, setIsPrescriptionDialogOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`${ORDERS}/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })

  const cancelOrderMutation = useMutation({
    mutationFn: async (reason: string) => {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log(`Cancelling order ${id} with reason: ${reason}`)
      return { success: true, message: "Order cancellation request submitted successfully." }
    },
    onSuccess: (data) => {
      toast.success(data.message)
      setIsCancelDialogOpen(false)
      setCancellationReason("")
      queryClient.invalidateQueries({ queryKey: ["order", id] })
    },
    onError: (error) => {
      toast.error("Failed to cancel order. Please try again.")
      console.error("Cancellation error:", error)
    },
  })

  const returnOrderMutation = useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      return { success: true, message: "Order return request submitted successfully." }
    },
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["order", id] })
    },
    onError: (error) => {
      toast.error("Failed to return order. Please try again.")
      console.error("Return error:", error)
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center">
              <Loader2Icon className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-6" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Order Details</h3>
              <p className="text-gray-600">Please wait while we fetch your order information...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <XCircle className="h-20 w-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We couldn't find the order you're looking for. It may have been removed or the link might be incorrect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/orders">
                <Button className="bg-blue-600 hover:bg-blue-700">View All Orders</Button>
              </Link>
              <Link to="/">
                <Button variant="outline">Go to Homepage</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleWhatsAppContact = () => {
    const phoneNumber = "918805823646"
    const message = `Hello! I need assistance with my order.

Order ID: ${order.orderId}
Order Date: ${formatDate(order.createdAt)}
Status: ${order.status}
Total Amount: ₹${order.orderSummary?.total?.toFixed(2)}

Please help me with my query. Thank you!`

    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${phoneNumber}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`

    const newWindow = window.open(whatsappUrl, "_blank", "noopener,noreferrer")
    if (!newWindow) {
      window.location.href = whatsappUrl
    }
  }

  const handleDownloadInvoice = () => {
    if (order.pdf) {
      try {
        const binaryString = atob(order.pdf)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }

        const blob = new Blob([bytes], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = url
        link.download = `Invoice-${order.orderId}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        URL.revokeObjectURL(url)
        toast.success("Invoice downloaded successfully!")
      } catch (error) {
        console.error("Error downloading invoice:", error)
        toast.error("Failed to download invoice. Please try again.")
      }
    } else {
      toast.error("Invoice not available for this order.")
    }
  }

  const handleDownloadPrescription = async () => {
    if (order?.prescriptionDetails?.prescriptionUrl) {
      try {
        const response = await fetch(order.prescriptionDetails.prescriptionUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `prescription-${order.prescriptionDetails.patientName}-${order.orderId}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        toast.success("Prescription downloaded successfully!")
      } catch (error) {
        console.error("Download failed:", error)
        const link = document.createElement("a")
        link.href = order.prescriptionDetails.prescriptionUrl
        link.download = `prescription-${order.prescriptionDetails.patientName}-${order.orderId}.jpg`
        link.target = "_blank"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
  }

  const resetZoom = () => {
    setZoomLevel(1)
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PLACED:
        return "bg-blue-50 text-blue-700 border-blue-200"
      case OrderStatus.SHIPPED:
        return "bg-purple-50 text-purple-700 border-purple-200"
      case OrderStatus.IN_TRANSIT:
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case OrderStatus.DELIVERED:
        return "bg-green-50 text-green-700 border-green-200"
      case OrderStatus.CANCELLED:
        return "bg-red-50 text-red-700 border-red-200"
      case OrderStatus.RETURNED:
        return "bg-orange-50 text-orange-700 border-orange-200"
      case OrderStatus.REFUNDED:
        return "bg-gray-50 text-gray-700 border-gray-200"
      case OrderStatus.PAYMENT_FAILED:
        return "bg-red-50 text-red-700 border-red-200"
      case OrderStatus.PAYMENT_PENDING:
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PLACED:
        return <Package className="h-4 w-4" />
      case OrderStatus.SHIPPED:
        return <CheckCircle className="h-4 w-4" />
      case OrderStatus.IN_TRANSIT:
        return <Truck className="h-4 w-4" />
      case OrderStatus.DELIVERED:
        return <CheckCircle className="h-4 w-4" />
      case OrderStatus.CANCELLED:
        return <XCircle className="h-4 w-4" />
      case OrderStatus.RETURNED:
        return <RotateCcw className="h-4 w-4" />
      case OrderStatus.REFUNDED:
        return <CheckCircle className="h-4 w-4" />
      case OrderStatus.PAYMENT_FAILED:
        return <XCircle className="h-4 w-4" />
      case OrderStatus.PAYMENT_PENDING:
        return <Clock className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const STATUS_VISUAL_MAP = {
    [OrderStatus.PLACED]: {
      label: "Placed",
      icon: Package,
      nodeBg: "bg-blue-600",
      lineBg: "bg-blue-600",
      text: "text-white",
    },
    [OrderStatus.SHIPPED]: {
      label: "Shipped",
      icon: CheckCircle,
      nodeBg: "bg-blue-600",
      lineBg: "bg-blue-600",
      text: "text-white",
    },
    [OrderStatus.IN_TRANSIT]: {
      label: "In Transit",
      icon: Truck,
      nodeBg: "bg-blue-600",
      lineBg: "bg-blue-600",
      text: "text-white",
    },
    [OrderStatus.DELIVERED]: {
      label: "Delivered",
      icon: CheckCircle,
      nodeBg: "bg-green-600",
      lineBg: "bg-green-600",
      text: "text-white",
    },
    [OrderStatus.CANCELLED]: {
      label: "Cancelled",
      icon: XCircle,
      nodeBg: "bg-red-600",
      lineBg: "bg-red-600",
      text: "text-white",
    },
    [OrderStatus.RETURNED]: {
      label: "Returned",
      icon: RotateCcw,
      nodeBg: "bg-red-600",
      lineBg: "bg-red-600",
      text: "text-white",
    },
    [OrderStatus.REFUNDED]: {
      label: "Refunded",
      icon: CheckCircle,
      nodeBg: "bg-red-600",
      lineBg: "bg-red-600",
      text: "text-white",
    },
    [OrderStatus.PAYMENT_FAILED]: {
      label: "Payment Failed",
      icon: XCircle,
      nodeBg: "bg-red-600",
      lineBg: "bg-red-600",
      text: "text-white",
    },
    [OrderStatus.PAYMENT_PENDING]: {
      label: "Payment Pending",
      icon: Clock,
      nodeBg: "bg-yellow-600",
      lineBg: "bg-yellow-600",
      text: "text-white",
    },
  }

  const parseStatusHistory = (historyString: string): OrderStatus[] => {
    if (!historyString) return []
    return historyString.split(" -> ").map((s) => s.replace(/ /g, "_").toUpperCase() as OrderStatus)
  }

  const actualJourneyStatuses = parseStatusHistory(order.statusHistory || "")

  const actualJourneySteps = actualJourneyStatuses.map((status) => {
    const visualProps = STATUS_VISUAL_MAP[status]
    if (!visualProps) {
      console.warn(`Unknown OrderStatus in history: ${status}`)
      return {
        status,
        label: status.replace(/_/g, " "),
        icon: Package,
        nodeBg: "bg-gray-400",
        lineBg: "bg-gray-400",
        text: "text-white",
      }
    }
    return { status, ...visualProps }
  })

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case "CARD":
        return "Credit/Debit Card"
      case "UPI":
        return "UPI"
      case "NET_BANKING":
        return "Net Banking"
      case "WALLET":
        return "Wallet"
      default:
        return "Online Payment"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/orders">
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <ArrowLeft className="h-4 w-4" />
                Back to Orders
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderId}</h1>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}
                  >
                    {getStatusIcon(order.status)}
                    {order.status.replace("_", " ")}
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-sm text-gray-600">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Placed on {formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">₹{order.orderSummary?.total?.toFixed(2)}</span>
                    </div>
                  </div>
                  {order.expectedDeliveryDate && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Expected by {formatDate(order.expectedDeliveryDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
                {order.status !== "PAYMENT_FAILED" && order.payment?.status !== "FAILED" && (
                  <Button
                    onClick={handleDownloadInvoice}
                    variant="outline"
                    className="flex items-center gap-2 bg-white hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4" />
                    Download Invoice
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Progress */}
        {(() => {
          const ORDER_PROGRESS_FLOW = [
            OrderStatus.PLACED,
            OrderStatus.SHIPPED,
            OrderStatus.IN_TRANSIT,
            OrderStatus.DELIVERED,
          ]

          const isTerminalState = [
            OrderStatus.CANCELLED,
            OrderStatus.RETURNED,
            OrderStatus.REFUNDED,
            OrderStatus.PAYMENT_FAILED,
          ].includes(order.status)

          const progressStepsToDisplay = isTerminalState
            ? order.status === OrderStatus.PAYMENT_FAILED
              ? [{ status: OrderStatus.PAYMENT_FAILED, ...STATUS_VISUAL_MAP[OrderStatus.PAYMENT_FAILED] }]
              : actualJourneySteps
            : ORDER_PROGRESS_FLOW.map((status) => {
                const visualProps = STATUS_VISUAL_MAP[status]
                return { status, ...visualProps }
              })

          return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Order Status
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  {progressStepsToDisplay.map((step, index) => {
                    const isLastStep = index === progressStepsToDisplay.length - 1
                    const isCurrent = actualJourneyStatuses.includes(step.status)

                    const nodeBgClass = isCurrent ? step.nodeBg : "bg-gray-400"
                    const nodeTextClass = step.text
                    const labelTextClass = isCurrent ? "text-gray-900" : "text-gray-500"
                    const lineClass = isCurrent ? step.lineBg : "bg-gray-200"

                    return (
                      <div key={step.status} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${nodeBgClass}`}
                          >
                            <step.icon className={`h-5 w-5 ${nodeTextClass}`} />
                          </div>
                          <span className={`text-sm font-medium mt-2 text-center ${labelTextClass}`}>{step.label}</span>
                        </div>
                        {!isLastStep && (
                          <div className="flex-1 mx-4">
                            <div className={`h-0.5 w-full ${lineClass}`} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })()}

        {/* Shipping Details */}
        {(order.status === OrderStatus.SHIPPED || order.status === OrderStatus.IN_TRANSIT) && order.shippingDetails && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Shipping Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {order.shippingDetails.courierName && (
                <div>
                  <span className="text-blue-700 font-medium">Courier Partner:</span>
                  <p className="text-blue-900">{order.shippingDetails.courierName}</p>
                </div>
              )}
              {order.shippingDetails.trackingNumber && (
                <div>
                  <span className="text-blue-700 font-medium">Tracking Number:</span>
                  <p className="font-mono text-blue-900">{order.shippingDetails.trackingNumber}</p>
                </div>
              )}
              {order.shippingDetails.trackingURL && (
                <div>
                  <a
                    href={order.shippingDetails.trackingURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Track Package
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prescription Details */}
        {order.prescriptionDetails && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Prescription Details
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Patient Name</p>
                    <p className="text-sm text-gray-600">{order.prescriptionDetails.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Patient Age</p>
                    <p className="text-sm text-gray-600">{order.prescriptionDetails.patientAge} years</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Gender</p>
                    <p className="text-sm text-gray-600 capitalize">{order.prescriptionDetails.patientGender}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Doctor Name</p>
                    <p className="text-sm text-gray-600">{order.prescriptionDetails.doctorName}</p>
                  </div>
                  {order.prescriptionDetails.patientBloodGroup && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Blood Group</p>
                      <p className="text-sm text-gray-600">{order.prescriptionDetails.patientBloodGroup}</p>
                    </div>
                  )}
                  {order.prescriptionDetails.patientHeight && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Height</p>
                      <p className="text-sm text-gray-600">{order.prescriptionDetails.patientHeight}</p>
                    </div>
                  )}
                  {order.prescriptionDetails.patientWeight && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Weight</p>
                      <p className="text-sm text-gray-600">{order.prescriptionDetails.patientWeight}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <img
                    src={order.prescriptionDetails.prescriptionUrl || "/placeholder.svg?height=300&width=200"}
                    alt="Prescription"
                    className="w-full max-w-md rounded-lg shadow-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setIsPrescriptionDialogOpen(true)}
                  />
                  <p className="text-sm text-gray-500 mt-2">Click to view full size</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Order Items ({order.products?.length || 0})
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {order.products?.map((item: any, index: any) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <Link to={`/product/${item.product?.slug}`} className="flex-shrink-0">
                  <img
                    className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                    src={item.product?.images?.[0] || "/placeholder.svg?height=80&width=80"}
                    alt={item.product?.name}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${item.product?.slug}`}
                    className="font-semibold text-gray-900 hover:text-blue-600 transition-colors block mb-2"
                  >
                    {item.product?.name}
                  </Link>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Variant:</span> {item.variant?.name}
                    </p>
                    <p>
                      <span className="font-medium">Quantity:</span> {item.quantity}
                    </p>
                    <p>
                      <span className="font-medium">Brand:</span> {item.product?.brand?.name}
                    </p>
                    <p>
                      <span className="font-medium">Category:</span> {item.product?.category?.name}
                    </p>
                    {item.originalPrice && item.productDiscount > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 line-through">₹{item.originalPrice?.toFixed(2)}</span>
                        <span className="text-sm text-green-600 font-medium">{item.productDiscount}% off</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">₹{item.price?.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">per item</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Order Summary</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Original price ({order.products?.length || 0} items)</span>
                <span className="font-medium">₹{order.orderSummary?.originalPrice?.toFixed(2)}</span>
              </div>
              {order.orderSummary?.productDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Product Discount</span>
                  <span className="font-medium text-green-600">
                    -₹{order.orderSummary?.productDiscount?.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{order.orderSummary?.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Coupon Discount</span>
                <span className="font-medium text-green-600">
                  -₹{(order.orderSummary?.couponDiscount || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping Charges</span>
                <span className="font-medium">
                  {order.orderSummary?.shipping > 0 ? (
                    `₹${order.orderSummary?.shipping?.toFixed(2)}`
                  ) : (
                    <span className="text-green-600">FREE</span>
                  )}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-blue-600">₹{order.orderSummary?.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        {order.payment && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Payment Details
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Payment Method</p>
                  <p className="text-sm text-gray-600">{getPaymentMethodDisplay(order.payment.method)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Payment Status</p>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${
                      order.payment.status === "COMPLETED"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : order.payment.status === "PENDING"
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : order.payment.status === "FAILED"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {order.payment.status}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Amount</p>
                  <p className="text-sm text-gray-600">
                    ₹{order.payment.amount?.toFixed(2)} {order.payment.currency}
                  </p>
                </div>
                {order.payment.transactionId && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Transaction ID</p>
                    <p className="text-sm text-gray-600 font-mono">{order.payment.transactionId}</p>
                  </div>
                )}
                {order.payment.paymentDate && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Payment Date</p>
                    <p className="text-sm text-gray-600">{formatDate(order.payment.paymentDate)}</p>
                  </div>
                )}
                {order.payment.gateway && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Payment Gateway</p>
                    <p className="text-sm text-gray-600">{order.payment.gateway}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Customer & Delivery Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Customer Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Full Name</p>
                <p className="text-sm text-gray-600">{order.user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Email Address</p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  {order.user.email}
                </p>
              </div>
              {order.user.phone && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Phone Number</p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    {order.user.phone}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Information
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {order.status !== "PAYMENT_FAILED" &&
                order.status !== "PAYMENT_PENDING" &&
                order.status !== "CANCELLED" &&
                order.expectedDeliveryDate && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Expected Delivery</p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(order.expectedDeliveryDate)}
                    </p>
                  </div>
                )}
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Delivery Address</p>
                <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                  </p>
                  <p className="flex items-center gap-2 pt-1">
                    <Phone className="h-3 w-3" />
                    {order.shippingAddress.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Order Actions</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {order.userActions?.canCancel && (
                <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        Cancel Order #{order.orderId}
                      </DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel this order? Please provide a reason to help us improve our
                        service.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="reason" className="text-sm font-medium">
                          Reason for Cancellation *
                        </Label>
                        <Input
                          id="reason"
                          value={cancellationReason}
                          onChange={(e) => setCancellationReason(e.target.value)}
                          placeholder="e.g., Ordered by mistake, Found better price elsewhere, Changed my mind"
                          className="w-full"
                        />
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                          <strong>Note:</strong> Once cancelled, this action cannot be undone. Any payment made will be
                          refunded within 5-7 business days.
                        </p>
                      </div>
                    </div>
                    <DialogFooter className="gap-2">
                      <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                        Keep Order
                      </Button>
                      <Button
                        onClick={() => cancelOrderMutation.mutate(cancellationReason)}
                        disabled={cancelOrderMutation.isPending || !cancellationReason.trim()}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {cancelOrderMutation.isPending ? (
                          <>
                            <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                            Cancelling...
                          </>
                        ) : (
                          "Cancel Order"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {order.userActions?.canReturn && (
                <Button
                  variant="outline"
                  onClick={() => returnOrderMutation.mutate()}
                  disabled={returnOrderMutation.isPending}
                  className="flex items-center gap-2 border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  {returnOrderMutation.isPending ? (
                    <>
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4" />
                      Return Order
                    </>
                  )}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={handleWhatsAppContact}
                className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
              >
                <MessageCircle className="h-4 w-4" />
                Need Help?
              </Button>
            </div>
          </div>
        </div>

        {/* Prescription Modal */}
        {order.prescriptionDetails && (
          <Dialog open={isPrescriptionDialogOpen} onOpenChange={setIsPrescriptionDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Prescription - {order.prescriptionDetails?.patientName}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">{Math.round(zoomLevel * 100)}%</span>
                  <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoomLevel >= 3}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetZoom}>
                    Reset
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadPrescription}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="overflow-auto max-h-[60vh] border rounded-lg">
                  <img
                    src={order.prescriptionDetails?.prescriptionUrl || "/placeholder.svg?height=600&width=400"}
                    alt="Prescription"
                    className="transition-transform duration-200"
                    style={{ transform: `scale(${zoomLevel})` }}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
