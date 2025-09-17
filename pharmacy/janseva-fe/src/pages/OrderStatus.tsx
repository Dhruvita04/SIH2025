"use client"

import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid"
import { useEffect, useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import axiosInstance from "@/utils/API"
import toast from "react-hot-toast"
import { ORDER_STATUS } from "@/CONFIG/api-routes"
import ProgressTracker from "@/components/checkout/ProgressTracker"
import { steps } from "@/CONFIG/checkout"
import useCart from "@/store/useCart"

interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
  message?: string
}

function OrderStatus() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [orderData, setOrderData] = useState({
    orderNumber: "", // This will now store the orderId
    date: "",
    paymentMethod: "",
    name: "",
    address: "",
    phone: "",
    email: "",
    totalAmount: "",
    estimatedDelivery: "",
    status: "",
    city: "",
    state: "",
    pincode: "",
    pdfUrl: "",
    canRetryPayment: false, // Flag to determine if payment can be retried
  })
  const [paymentStatus, setPaymentStatus] = useState({
    status: "",
    amount: "",
    method: "",
    transactionId: "",
  })
  const [loading, setLoading] = useState(true)
  const [retryingPayment, setRetryingPayment] = useState(false)
  const { clearCart } = useCart()

  // Verify payment status first, then fetch order details
  const verifyPaymentAndFetchOrder = async () => {
    try {
      setLoading(true)

      // First verify payment status - using relative path without /api/v1 prefix
      const paymentResponse = await axiosInstance.get(`/payment/verify/${id}`)

      if (paymentResponse.data.status === "success") {
        const paymentData = paymentResponse.data.data
        setPaymentStatus({
          status: paymentData.status,
          amount: paymentData.amount?.toString() || "",
          method: paymentData.method || "",
          transactionId: paymentData.transactionId || "",
        })

        // Handle different payment statuses
        switch (paymentData.status) {
          case "COMPLETED":
            // Payment successful, fetch order details and clear cart
            await fetchOrderDetails()
            clearCart() // Clear the cart after successful payment
            break
          case "FAILED":
            // Payment failed, but still fetch order details to show user
            toast.error("Payment failed. Please try again.")
            await fetchOrderDetails() // Still fetch order details
            setOrderData((prev) => ({ ...prev, status: "Payment Failed" }))
            break
          case "PENDING":
            // Payment still pending, fetch order details and start polling
            toast.success("Payment is being processed...")
            await fetchOrderDetails() // Fetch order details even for pending
            setOrderData((prev) => ({ ...prev, status: "Payment Processing" }))
            pollPaymentStatus()
            break
          default:
            console.warn("Unknown payment status:", paymentData.status)
            await fetchOrderDetails() // Still try to fetch order details
            setOrderData((prev) => ({ ...prev, status: "Payment Status Unknown" }))
        }
      } else {
        toast.error("Failed to verify payment status")
      }
    } catch (error) {
      console.error("Error verifying payment:", error)
      toast.error("Something went wrong while verifying payment")
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderDetails = async () => {
    try {
      const response = await axiosInstance.get(`${ORDER_STATUS}/${id}`)

      if (response.data.status === "success") {
        const data = response.data.data

        const addressLine1 = data.details.shippingAddress?.line1 || ""
        const addressLine2 = data.details.shippingAddress?.line2 || ""
        const fullAddress = [addressLine1, addressLine2].filter(Boolean).join(" ")

        setOrderData({
          orderNumber: `#${data.details.orderId || id}`, // Display orderId as requested
          date: new Date(data.details.createdAt).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          paymentMethod: data.details.payment?.method || "-", // Access payment.method
          name: data.details.shippingAddress?.name || "-",
          address: fullAddress || "-",
          phone: data.details.shippingAddress?.phone || "-",
          email: data.details.user?.email || "-", // Keep as is, will be "-" if user is not in JSON
          totalAmount: data.details.orderTotal?.toFixed(2) || "-",
          estimatedDelivery: data.details.estimatedDelivery || "-",
          status: data.details.status || "Your Order has been placed.", // Use details.status for order status
          city: data.details.shippingAddress?.city || "-",
          state: data.details.shippingAddress?.state || "-",
          pincode: data.details.shippingAddress?.postalCode || "-",
          pdfUrl: data.pdf || "",
          canRetryPayment: data.details.userActions?.canRetryPayment || false, // Get retry flag from API
        })
      } else {
        toast.error("Failed to fetch order details")
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
      toast.error("Something went wrong while fetching order details")
    }
  }

  // Poll payment status for pending payments
  const pollPaymentStatus = async (maxAttempts = 10, interval = 3000) => {
    let attempts = 0

    const poll = async () => {
      attempts++

      try {
        const response = await axiosInstance.get(`/payment/verify/${id}`)

        if (response.data.status === "success") {
          const paymentData = response.data.data

          setPaymentStatus({
            status: paymentData.status,
            amount: paymentData.amount?.toString() || "",
            method: paymentData.method || "",
            transactionId: paymentData.transactionId || "",
          })

          if (paymentData.status === "COMPLETED") {
            toast.success("Payment completed successfully!")
            await fetchOrderDetails()
            clearCart() // Clear cart when payment completes during polling
            return // Stop polling
          } else if (paymentData.status === "FAILED") {
            toast.error("Payment failed")
            setOrderData((prev) => ({ ...prev, status: "Payment Failed" }))
            return // Stop polling
          }
        }

        // Continue polling if still pending and haven't exceeded max attempts
        if (attempts < maxAttempts) {
          setTimeout(poll, interval)
        } else {
          // Max attempts reached
          toast.error("Payment verification timeout. Please check back later.")
          setOrderData((prev) => ({ ...prev, status: "Payment Verification Timeout" }))
        }
      } catch (error) {
        console.error("Polling error:", error)
        if (attempts < maxAttempts) {
          setTimeout(poll, interval)
        }
      }
    }

    // Start polling
    setTimeout(poll, interval)
  }

  // Handle retry payment functionality
  const handleRetryPayment = async () => {
    if (!id) {
      toast.error("Order ID not found")
      return
    }

    try {
      setRetryingPayment(true)

      const response = await axiosInstance.post("/payment/retry", {
        orderId: id,
      })

      if (response.data.status === "success") {
        const { paymentSession } = response.data.data

        if (paymentSession && paymentSession.payment_session_id) {
          // Store the payment session data for the payment page
          sessionStorage.setItem("paymentSession", JSON.stringify(paymentSession))
          sessionStorage.setItem("orderId", id)

          toast.success("Redirecting to payment page...")

          // Navigate to payment page with the new session
          navigate(`/payment?session=${paymentSession.payment_session_id}&order=${id}`)
        } else {
          toast.error("Invalid payment session received")
        }
      } else {
        toast.error(response.data.message || "Failed to retry payment")
      }
    } catch (error) {
      console.error("Error retrying payment:", error)

      const apiError = error as ApiError
      if (apiError.response?.data?.message) {
        toast.error(apiError.response.data.message)
      } else if (apiError.message) {
        toast.error(apiError.message)
      } else {
        toast.error("An unexpected error occurred. Please try again.")
      }
    } finally {
      setRetryingPayment(false)
    }
  }

  useEffect(() => {
    if (id) {
      verifyPaymentAndFetchOrder()
    }
  }, [id])

  const handleDownloadInvoice = () => {
    if (orderData.pdfUrl) {
      try {
        // Decode base64 string to binary string
        const binaryString = atob(orderData.pdfUrl)
        const len = binaryString.length
        const bytes = new Uint8Array(len)
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }

        // Create a Blob from the binary data
        const blob = new Blob([bytes], { type: "application/pdf" })

        // Create a URL for the Blob
        const url = URL.createObjectURL(blob)

        // Create a temporary anchor element
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `Invoice-${orderData.orderNumber}.pdf`)
        link.setAttribute("target", "_blank") // Open in a new tab
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Revoke the object URL after a short delay to allow download to start
        setTimeout(() => URL.revokeObjectURL(url), 100)
        toast.success("Invoice download started")
      } catch (error) {
        console.error("Error downloading invoice:", error)
        toast.error("Failed to generate or download invoice.")
      }
    } else {
      toast.error("Invoice not available for download")
    }
  }

  const [currentStep] = useState(4)

  // Determine card styling based on payment status
  const getCardStyling = () => {
    switch (paymentStatus.status) {
      case "COMPLETED":
        return {
          cardBg: "bg-[#13866d]",
          iconBg: "bg-[#13866d]",
          icon: CheckIcon,
          statusBg: "bg-[#e1f2e8]",
          statusText: "text-gray-600",
        }
      case "FAILED":
        return {
          cardBg: "bg-red-600",
          iconBg: "bg-red-600",
          icon: XMarkIcon,
          statusBg: "bg-red-100",
          statusText: "text-red-700",
        }
      case "PENDING":
        return {
          cardBg: "bg-orange-500",
          iconBg: "bg-orange-500",
          icon: CheckIcon,
          statusBg: "bg-orange-100",
          statusText: "text-orange-700",
        }
      default:
        return {
          cardBg: "bg-gray-500",
          iconBg: "bg-gray-500",
          icon: CheckIcon,
          statusBg: "bg-gray-100",
          statusText: "text-gray-600",
        }
    }
  }

  const cardStyle = getCardStyling()
  const IconComponent = cardStyle.icon

  return (
    <div className="w-full p-[12px]">
      <ProgressTracker steps={steps} currentStep={currentStep} />

      {/* <h1 className="text-2xl font-bold text-gray-600 mb-4">Order Status</h1> */}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#13866d]"></div>
        </div>
      ) : (
        <div className="w-full md:flex md:p-8 md:justify-between md:items-start">
          <div className="relative mt-[48px]">
            <div
              className={`w-full h-[90vw] max-w-[380px] max-h-[380px] ${cardStyle.cardBg} rounded-2xl relative overflow-hidden`}
            >
              <div className="w-full flex flex-col items-center pt-[64px]">
                <h2 className="text-2xl md:text-3xl font-semibold text-center mb-2 text-white">
                  {paymentStatus.status === "COMPLETED"
                    ? "Thank you for your order!"
                    : paymentStatus.status === "FAILED"
                      ? "Payment Failed"
                      : "Order Status"}
                </h2>
                <h4 className="w-[75%] text-md md:text-lg font-medium text-center text-slate-200">
                  {paymentStatus.status === "COMPLETED"
                    ? "The order confirmation has been sent to your email address."
                    : paymentStatus.status === "FAILED"
                      ? "Your payment could not be processed. Please try again."
                      : "We are processing your order and payment."}
                </h4>

                <div className="w-full grid grid-cols-2 mt-10 md:mt-14">
                  <div className="w-full flex flex-col items-center">
                    <h3 className="text-xl font-bold text-white">
                      Rs. {orderData.totalAmount || paymentStatus.amount}
                    </h3>
                    <p className="text-lg text-slate-200">Total Amount</p>
                  </div>
                  <div className="w-full flex flex-col items-center">
                    <h3 className="text-xl font-bold text-white">{orderData.estimatedDelivery || "-"}</h3>
                    <p className="text-lg text-slate-200">Est. Delivery</p>
                  </div>
                </div>
              </div>
              <div
                className={`${cardStyle.statusBg} text-center py-4 font-medium text-sm ${cardStyle.statusText} absolute bottom-[12px] left-[12px] w-[calc(100%-24px)] rounded-xl`}
              >
                {orderData.status || `Payment ${paymentStatus.status}`}
              </div>
            </div>

            <span
              className={`w-[64px] h-[64px] ${cardStyle.iconBg} rounded-full flex justify-center items-center absolute -top-[38px] left-1/2 -translate-x-1/2 border-[6px] border-white box-content`}
            >
              <IconComponent className="w-[44px] h-[44px] text-white" />
            </span>
          </div>

          <div className="md:w-[calc(100%-416px)] md:mt-[40px] ">
            <div className="w-full rounded-2xl bg-gray-100 p-4 mt-4">
              <div className="w-full flex justify-between items-center py-3 border-b-[0.5px] border-gray-500">
                <p className="text-gray-600">Order number</p>
                <p className="font-bold text-right">{orderData.orderNumber}</p>
              </div>
              <div className="w-full flex justify-between items-center py-3 border-b-[0.5px] border-gray-500">
                <p className="text-gray-600">Date</p>
                <p className="font-bold text-right">{orderData.date}</p>
              </div>
              <div className="w-full flex justify-between items-center py-3 border-b-[0.5px] border-gray-500">
                <p className="text-gray-600">Payment Method</p>
                <p className="font-bold text-right">{paymentStatus.method || orderData.paymentMethod}</p>
              </div>
              <div className="w-full flex justify-between items-center py-3 border-b-[0.5px] border-gray-500">
                <p className="text-gray-600">Payment Status</p>
                <p
                  className={`font-bold text-right ${paymentStatus.status === "FAILED" ? "text-red-600" : paymentStatus.status === "COMPLETED" ? "text-green-600" : "text-orange-600"}`}
                >
                  {paymentStatus.status}
                </p>
              </div>
              {paymentStatus.transactionId && (
                <div className="w-full flex justify-between items-center py-3 border-b-[0.5px] border-gray-500">
                  <p className="text-gray-600">Transaction ID</p>
                  <p className="font-bold text-right">{paymentStatus.transactionId}</p>
                </div>
              )}
              <div className="w-full flex justify-between items-center py-3 border-b-[0.5px] border-gray-500">
                <p className="text-gray-600">Name</p>
                <p className="font-bold text-right">{orderData.name}</p>
              </div>
              <div className="w-full flex justify-between items-center py-3 border-b-[0.5px] border-gray-500">
                <p className="text-gray-600">Address</p>
                <p className="font-bold text-right">{orderData.address}</p>
              </div>
              <div className="w-full flex justify-between items-center py-3 border-b-[0.5px] border-gray-500">
                <p className="text-gray-600">City</p>
                <p className="font-bold text-right">{orderData.city}</p>
              </div>
              <div className="w-full flex justify-between items-center py-3 border-b-[0.5px] border-gray-500">
                <p className="text-gray-600">State</p>
                <p className="font-bold text-right">{orderData.state}</p>
              </div>
              <div className="w-full flex justify-between items-center py-3 border-b-[0.5px] border-gray-500">
                <p className="text-gray-600">Pincode</p>
                <p className="font-bold text-right">{orderData.pincode}</p>
              </div>
              <div className="w-full flex justify-between items-center py-3 border-b-[0.5px] border-gray-500">
                <p className="text-gray-600">Phone</p>
                <p className="font-bold text-right">{orderData.phone}</p>
              </div>
              <div className="w-full flex justify-between items-center py-3">
                <p className="text-gray-600">Email</p>
                <p className="font-bold text-right">{orderData.email}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-8 md:flex-row">
              <Link
                className="py-5 md:py-[10px] text-lg font-semibold w-full flex justify-center bg-primary text-white rounded-xl md:rounded-lg"
                to={"/"}
              >
                Continue Shopping
              </Link>
              <Link
                className="py-5 md:py-[10px] text-lg font-semibold w-full flex justify-center bg-gray-100 text-gray-700 rounded-xl md:rounded-lg border-2 border-gray-200"
                to={`/orders/${id}`}
              >
                Track Order
              </Link>
            </div>

            {/* Show Download Invoice button for completed payments */}
            {paymentStatus.status === "COMPLETED" && (
              <button
                onClick={handleDownloadInvoice}
                className="py-5 md:py-[10px] text-lg font-semibold w-full flex justify-center bg-red-600 text-white rounded-xl md:rounded-lg mt-4"
                disabled={!orderData.pdfUrl}
              >
                Download Invoice
              </button>
            )}

            {/* Show Pay Again button for failed payments if retry is allowed */}
            {paymentStatus.status === "FAILED" && orderData.canRetryPayment && (
              <button
                onClick={handleRetryPayment}
                disabled={retryingPayment}
                className="py-5 md:py-[10px] text-lg font-semibold w-full flex justify-center bg-red-600 text-white rounded-xl md:rounded-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {retryingPayment ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </div>
                ) : (
                  "Pay Again"
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderStatus
