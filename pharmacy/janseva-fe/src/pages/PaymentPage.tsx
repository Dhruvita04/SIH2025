"use client"

import { useEffect, useState, useMemo } from "react"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { CreditCardIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

import useCartFacade from "@/facades/useCartFacade"
import useAuthFacade from "@/facades/useAuthFacade"
import useAddressFacade from "@/facades/useAddressFacade"
import axiosInstance from "@/utils/API"
import { getDiscountBasedOnDiscountType } from "@/utils/helperFunctions"
import { PAYMENT_CREATE_SESSION } from "@/CONFIG/api-routes"
import environment from "@/CONFIG/environment"
import { getEnvironmentConfig } from "@/utils/getCashfree"

interface CreateOrderPaymentResponse {
  status: string
  message: string
  data: {
    order: {
      id: string
      orderId: string
      status: string
      orderTotal: number
    }
    paymentSession: {
      payment_session_id: string
      order_id: string
      temporary_order_id: string
    }
    paymentId: string
  }
}

interface OrderItem {
  productId: string
  variantId: string
  quantity: number
  price: number
}

interface CreateOrderPaymentRequest {
  addressId: string
  couponId?: string
  prescriptionId?: string
  subTotal: number
  discount: number
  shipping: number
  orderTotal: number
  items: OrderItem[]
}

export default function PaymentPage() {
  const [status, setStatus] = useState<"processing" | "failure">("processing")
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const { cartItems, coupon, prescription } = useCartFacade()
  const { user } = useAuthFacade()
  const { addressId } = useAddressFacade()

  const orderCalculations = useMemo(() => {
    // Calculate discounted prices for each item first
    const itemsWithDiscountedPrices = cartItems.map((c) => {
      const { price, discount, discountType } = c.cartItem.currentOption
      const discountAmount = getDiscountBasedOnDiscountType(price, discount, discountType)
      const discountedPrice = price - discountAmount

      return {
        ...c,
        discountedPrice: Number(discountedPrice.toFixed(2)),
        discountAmount: Number(discountAmount.toFixed(2)),
      }
    })

    // Calculate subtotal as sum of (discounted price × quantity) - GST inclusive
    const subTotal = itemsWithDiscountedPrices.reduce((sum, item) => {
      return sum + item.discountedPrice * item.quantity
    }, 0)

    // Calculate total discount amount (item discounts only)
    const totalDiscount = itemsWithDiscountedPrices.reduce((sum, item) => {
      return sum + item.discountAmount * item.quantity
    }, 0)

    // Calculate shipping using environment variables
    const minimumOrderForFreeShipping = Number(environment.MINIMUM_ORDER_FREE_SHIPPING)
    const shippingCharge = Number(environment.SHIPPING_CHARGE)
    const shipping = subTotal > minimumOrderForFreeShipping || subTotal === 0 ? 0 : shippingCharge

    // Calculate coupon discount
    const couponDiscount = coupon
      ? coupon.discountType === "AMOUNT"
        ? Number(coupon.discountValue)
        : (subTotal * Number(coupon.discountValue)) / 100
      : 0

    // Calculate order total (backend will handle GST calculations)
    const orderTotal = subTotal + shipping - couponDiscount

    return {
      subTotal: Number(subTotal.toFixed(2)),
      discount: Number(couponDiscount.toFixed(2)), // Only coupon discount for backend
      shipping: Number(shipping.toFixed(2)),
      orderTotal: Number(orderTotal.toFixed(2)),
      itemsWithDiscountedPrices,
      totalItemDiscount: Number(totalDiscount.toFixed(2)), // For display only
      couponDiscount: Number(couponDiscount.toFixed(2)), // For display only
    }
  }, [cartItems, coupon])

  const createOrderAndPayment = useMutation({
    mutationFn: async (payload: CreateOrderPaymentRequest) => {
      const response = await axiosInstance.post(PAYMENT_CREATE_SESSION, payload)
      return response.data as CreateOrderPaymentResponse
    },
    onSuccess: ({ status: responseStatus, data, message }) => {
      if (responseStatus !== "success") {
        throw new Error(message || "Order creation failed")
      }

      const { order, paymentSession, paymentId } = data

      console.log("Order created:", order)
      console.log("Payment session:", paymentSession)
      console.log("Payment ID:", paymentId)

      // Store order ID and payment ID for later verification
      localStorage.setItem("currentOrderId", order.id)
      localStorage.setItem("currentPaymentId", paymentId)

      // Initialize Cashfree payment
      initializeCashfreePayment({
        orderId: order.id,
        orderNumber: order.orderId,
        paymentSessionId: paymentSession.payment_session_id,
        cashfreeOrderId: paymentSession.order_id,
        paymentId: paymentId,
      })
    },
    onError: (err: any) => {
      console.error("Order creation error:", err)
      setError(err.response?.data?.message || err.message || "Failed to create order and payment session")
      setStatus("failure")
    },
  })

  const initializeCashfreePayment = (paymentData: {
    orderId: string
    orderNumber: string
    paymentSessionId: string
    cashfreeOrderId: string
    paymentId: string
  }) => {
    try {
      // Load Cashfree SDK if not already loaded
      if (!(window as any).Cashfree) {
        const script = document.createElement("script")
        script.src = "https://sdk.cashfree.com/js/v3/cashfree.js"
        script.onload = () => initializePaymentWidget(paymentData)
        script.onerror = () => {
          setError("Failed to load payment gateway")
          setStatus("failure")
        }
        document.head.appendChild(script)
      } else {
        initializePaymentWidget(paymentData)
      }
    } catch (error: any) {
      console.error("Payment initialization error:", error)
      setError(error.message || "Failed to initialize payment")
      setStatus("failure")
    }
  }

  const initializePaymentWidget = (paymentData: {
    orderId: string
    orderNumber: string
    paymentSessionId: string
    cashfreeOrderId: string
    paymentId: string
  }) => {
    try {
      let envConfig
      try {
        envConfig = getEnvironmentConfig()
      } catch (envError: any) {
        console.error("Environment configuration error:", envError)
        setError(`Configuration Error: ${envError.message}`)
        setStatus("failure")
        return
      }

      const { mode } = envConfig

      const cashfree = (window as any).Cashfree({
        mode: mode, // Now properly uses "sandbox" or "production" string
      })

      const checkoutOptions = {
        paymentSessionId: paymentData.paymentSessionId,
        returnUrl: `${window.location.origin}/order/status/${paymentData.orderId}`,
        redirectTarget: "_self",
      }

      console.log("Initializing Cashfree checkout with options:", checkoutOptions)
      console.log("Cashfree mode:", mode)
      console.log("Environment CASHFREE_API_STATUS:", environment.CASHFREE_API_STATUS)
      console.log("Using checkout URL:", envConfig.checkoutUrl)

      cashfree
        .checkout(checkoutOptions)
        .then((result: any) => {
          if (result.error) {
            console.error("Payment initialization failed:", result.error)
            setError(result.error.message || "Payment initialization failed")
            setStatus("failure")
          }
          if (result.redirect) {
            console.log("Payment completed, redirecting...")
            // Payment completed, user will be redirected to returnUrl
          }
        })
        .catch((e: any) => {
          console.error("Checkout error:", e)
          setError(e.message || "Checkout failed")
          setStatus("failure")
        })
    } catch (error: any) {
      console.error("Payment widget initialization error:", error)
      setError(error.message || "Failed to initialize payment widget")
      setStatus("failure")
    }
  }

  useEffect((): void => {
    // Validation checks
    if (!cartItems.length) {
      toast.error("Cart is empty")
      return void navigate("/")
    }
    if (!user?.id) {
      toast.error("Login required")
      return void navigate("/login")
    }
    if (!addressId) {
      toast.error("Select address")
      return void navigate("/cart")
    }

    // Prepare order items with discounted prices (GST inclusive)
    const items: OrderItem[] = orderCalculations.itemsWithDiscountedPrices.map((item) => ({
      productId: item.cartItem.productDetails.id,
      variantId: item.cartItem.currentOption.id,
      quantity: item.quantity,
      price: item.discountedPrice, // Final discounted price per unit (GST inclusive)
    }))

    // Prepare order payload (no GST fields - backend will handle GST)
    const orderPayload: CreateOrderPaymentRequest = {
      addressId: String(addressId),
      ...(coupon?.code && { couponId: coupon.code }),
      ...(prescription?.id && { prescriptionId: prescription.id }),
      subTotal: orderCalculations.subTotal, // Sum of all (item.price * item.quantity) - GST INCLUSIVE
      discount: orderCalculations.discount, // Coupon discount amount
      shipping: orderCalculations.shipping, // Shipping cost using environment variables
      orderTotal: orderCalculations.orderTotal, // subTotal - discount + shipping
      items,
    }

    console.log("Creating order with payload:", orderPayload)
    console.log("Calculation breakdown:")
    console.log("- Items with discounted prices (GST inclusive):", orderCalculations.itemsWithDiscountedPrices)
    console.log("- Subtotal (sum of discounted prices × quantity):", orderCalculations.subTotal)
    console.log("- Item discount amount (for display):", orderCalculations.totalItemDiscount)
    console.log("- Coupon discount:", orderCalculations.couponDiscount)
    console.log("- Shipping (using env vars):", orderCalculations.shipping)
    console.log("- Minimum order for free shipping:", environment.MINIMUM_ORDER_FREE_SHIPPING)
    console.log("- Shipping charge:", environment.SHIPPING_CHARGE)
    console.log("- Order total (before backend GST calculation):", orderCalculations.orderTotal)

    createOrderAndPayment.mutate(orderPayload)
  }, [cartItems, user, addressId, coupon, prescription, orderCalculations, navigate])

  const retry = () => {
    // Clear stored data and reload
    localStorage.removeItem("currentOrderId")
    localStorage.removeItem("currentPaymentId")
    window.location.reload()
  }

  const goBackToCart = () => {
    // Clear stored data and go back to cart
    localStorage.removeItem("currentOrderId")
    localStorage.removeItem("currentPaymentId")
    navigate("/cart")
  }

  return (
    <section className="py-8 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 shadow rounded">
        {status === "processing" ? (
          <>
            <CreditCardIcon className="mx-auto h-12 w-12 text-blue-600" />
            <h2 className="mt-4 text-xl text-center">Processing Payment…</h2>
            <p className="mt-2 text-center text-gray-600">
              {createOrderAndPayment.isPending
                ? "Creating your order and initializing payment..."
                : "Redirecting to payment gateway..."}
            </p>
            {createOrderAndPayment.isPending && (
              <div className="mt-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}
          </>
        ) : (
          <>
            <XIcon className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl text-center">Payment Failed</h2>
            <p className="mt-2 text-center text-red-600">{error}</p>
            <div className="mt-6 flex justify-center space-x-4">
              <Button onClick={retry}>Try Again</Button>
              <Button variant="outline" onClick={goBackToCart}>
                Back to Cart
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
