"use client"

import { getDiscountBasedOnDiscountType } from "@/utils/helperFunctions"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import type { Prescription, Coupon } from "./types"
import type { Address } from "@/types"
import environment from "@/CONFIG/environment"

export default function OrderSummaryCard({
  cartItems,
  handleCheckout,
  prescription,
  coupon,
  address,
  currentPath,
  isAuthenticated,
  isCheckingOut,
}: {
  cartItems: any[]
  handleCheckout: (prescription: Prescription | null, coupon: Coupon | null, address: Address | null) => void
  prescription: Prescription | null
  coupon: Coupon | null
  address: Address | null
  currentPath?: string
  isAuthenticated?: boolean
  isCheckingOut?: boolean
}) {
  const [shippingCharges, setShippingCharges] = useState(0)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [finalTotal, setFinalTotal] = useState(0)

  // Calculate totals using useMemo to prevent recalculation on every render
  const { grossTotal, discountTotal, subTotal } = useMemo(() => {
    // Calculate gross total (original prices - GST inclusive)
    const tempGrossTotal = cartItems.reduce((total, ci) => {
      const { cartItem, quantity } = ci
      const { currentOption } = cartItem
      const { price } = currentOption
      return Number((total + price * quantity).toFixed(2))
    }, 0)

    // Calculate total discount amount
    const tempDiscountTotal = cartItems.reduce((total, ci) => {
      const { cartItem, quantity } = ci
      const { currentOption } = cartItem
      const { price, discount, discountType } = currentOption
      const currentDiscount = getDiscountBasedOnDiscountType(price, discount, discountType)
      return Number((total + currentDiscount * quantity).toFixed(2))
    }, 0)

    // Calculate subtotal as sum of (discounted price × quantity) - GST inclusive
    const tempSubTotal = cartItems.reduce((total, ci) => {
      const { cartItem, quantity } = ci
      const { currentOption } = cartItem
      const { price, discount, discountType } = currentOption
      const discountAmount = getDiscountBasedOnDiscountType(price, discount, discountType)
      const discountedPrice = price - discountAmount
      return Number((total + discountedPrice * quantity).toFixed(2))
    }, 0)

    return {
      grossTotal: tempGrossTotal,
      discountTotal: tempDiscountTotal,
      subTotal: tempSubTotal,
    }
  }, [cartItems])

  // Calculate shipping, coupon discount, and final total
  useEffect(() => {
    const minimumOrderForFreeShipping = Number(environment.MINIMUM_ORDER_FREE_SHIPPING)
    const shippingAmount = Number(environment.SHIPPING_CHARGE)
    const tempShippingCharges = subTotal > minimumOrderForFreeShipping ? 0 : subTotal === 0 ? 0 : shippingAmount

    const couponDiscountValue =
      coupon?.discountType == "AMOUNT"
        ? Number(coupon.discountValue)
        : subTotal * (Number(coupon?.discountValue || 0) / 100)

    // Final total is simply subtotal + shipping - coupon discount (GST inclusive)
    const tempFinalTotal = Number((subTotal + tempShippingCharges - couponDiscountValue).toFixed(2))

    setCouponDiscount(couponDiscountValue)
    setShippingCharges(tempShippingCharges)
    setFinalTotal(tempFinalTotal)
  }, [subTotal, coupon])

  const getButtonText = () => {
    if (!isAuthenticated) {
      return "Login and Checkout"
    }

    if (currentPath?.includes("cart")) {
      return "Select Address"
    } else if (currentPath?.includes("address")) {
      return "Confirm Order"
    } else if (currentPath?.includes("summary")) {
      return "Proceed to Payment"
    }

    return "Select Address" // Default fallback
  }

  const getLoadingText = () => {
    if (currentPath?.includes("cart")) {
      return "Processing..."
    } else if (currentPath?.includes("address")) {
      return "Processing..."
    } else if (currentPath?.includes("summary")) {
      return "Redirecting to Payment..."
    }
    return "Processing..."
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
      <p className="text-xl font-semibold text-gray-900 dark:text-white">Order summary</p>

      <div className="space-y-4">
        <div className="space-y-2">
          <dl className="flex items-center justify-between gap-4">
            <dt className="text-base font-normal text-gray-500 dark:text-gray-400 flex-shrink-0">Original price </dt>
            <dd className="text-base font-medium text-gray-900 dark:text-white whitespace-nowrap">
              Rs. {grossTotal.toFixed(2)}
            </dd>
          </dl>

          <dl className="flex items-center justify-between gap-4">
            <dt className="text-base font-normal text-gray-500 dark:text-gray-400 flex-shrink-0">Savings</dt>
            <dd className="text-base font-medium text-green-600 whitespace-nowrap">- Rs. {discountTotal.toFixed(2)}</dd>
          </dl>

          <dl className="flex items-center justify-between gap-4">
            <dt className="text-base font-normal text-gray-500 dark:text-gray-400 flex-shrink-0">Subtotal </dt>
            <dd className="text-base font-medium text-gray-900 dark:text-white whitespace-nowrap">
              Rs. {subTotal.toFixed(2)}
            </dd>
          </dl>

          <dl className="flex items-center justify-between gap-4">
            <dt className="text-base font-normal text-gray-500 dark:text-gray-400 flex-shrink-0">Shipping Charges</dt>
            <dd className="text-base font-medium text-gray-900 dark:text-white whitespace-nowrap">
              Rs. {shippingCharges.toFixed(2)}
            </dd>
          </dl>

          <dl className="flex items-center justify-between gap-4">
            <dt className="text-base font-normal text-gray-500 dark:text-gray-400 flex-shrink-0">Coupon Discount</dt>
            <dd className="text-base font-medium text-green-600 whitespace-nowrap">
              - Rs. {couponDiscount.toFixed(2)}
            </dd>
          </dl>
        </div>

        <dl className="flex items-center justify-between gap-4 border-t border-gray-200 pt-2 dark:border-gray-700">
          <dt className="text-base font-bold text-gray-900 dark:text-white flex-shrink-0">Total (incl. tax)</dt>
          <dd className="text-base font-bold text-gray-900 dark:text-white whitespace-nowrap">
            Rs. {finalTotal.toFixed(2)}
          </dd>
        </dl>
      </div>

      <Button
        onClick={() => handleCheckout(prescription, coupon, address)}
        disabled={cartItems.length === 0 || isCheckingOut}
        className="flex w-full items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
      >
        {isCheckingOut ? getLoadingText() : getButtonText()}
      </Button>

      <div className="flex items-center justify-center gap-2">
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400"> or </span>
        <a
          href="#"
          title="Continue Shopping"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 underline hover:no-underline dark:text-primary-500"
        >
          Continue Shopping
          <svg
            className="h-5 w-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 12H5m14 0-4 4m4-4-4-4"
            />
          </svg>
        </a>
      </div>
    </div>
  )
}
