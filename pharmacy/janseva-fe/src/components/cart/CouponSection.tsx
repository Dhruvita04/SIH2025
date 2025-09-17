"use client"

import type React from "react"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/utils/API"
import { toast } from "react-hot-toast"
import useAuthFacade from "@/facades/useAuthFacade"
import { COUPON } from "@/CONFIG/api-routes"
import useCartFacade from "@/facades/useCartFacade"
import { getDiscountBasedOnDiscountType } from "@/utils/helperFunctions"

function CouponSection() {
  const [couponCode, setCouponCode] = useState("")
  const [error, setError] = useState("")
  const { user } = useAuthFacade()
  const { coupon, setCoupon, cartItems } = useCartFacade()

  const applyCouponMutation = useMutation({
    mutationFn: (payload: { userId: string; couponCode: string; cartTotal: number }) => {
      return axiosInstance.post(COUPON, payload)
    },
    onSuccess: (data) => {
      if (data.data.data) {
        toast.success("Coupon applied successfully!")
        console.log(data.data.data)
        setCoupon(data.data.data)
        setCouponCode("")
        setError("")
      } else {
        toast.error(data.data.message)
        setError(data.data.message)
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to apply coupon")
    },
  })

  const calculateCartTotal = () => {
    // Calculate subtotal as sum of (discounted price × quantity) - same logic as OrderSummaryCard
    const cartTotal = cartItems.reduce((total, ci) => {
      const { cartItem, quantity } = ci
      const { currentOption } = cartItem
      const { price, discount, discountType } = currentOption
      const discountAmount = getDiscountBasedOnDiscountType(price, discount, discountType)
      const discountedPrice = price - discountAmount
      return Number((total + discountedPrice * quantity).toFixed(2))
    }, 0)

    return cartTotal
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!couponCode.trim()) {
      setError("Please enter a coupon code")
      return
    }

    const cartTotal = calculateCartTotal()

    applyCouponMutation.mutate({
      userId: user?.id || "",
      couponCode,
      cartTotal,
    })
  }

  const handleRemoveCoupon = () => {
    if (!coupon) return
    setCoupon(null)
    toast.success("Coupon removed successfully!")
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
      {coupon ? (
        <div className="flex items-center justify-between">
          <span className="text-sm text-green-600">Coupon {coupon.code} applied</span>
          <button onClick={handleRemoveCoupon} className="text-sm text-red-500 hover:text-red-700">
            Remove
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="voucher" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Do you have a voucher or gift card?
            </label>
            <input
              type="text"
              id="voucher"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value)
                setError("")
              }}
              className={`block w-full rounded-lg border ${error ? "border-red-500" : "border-gray-300"} bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500`}
              placeholder="Enter coupon code"
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={applyCouponMutation.isPending}
            className="flex w-full items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 disabled:opacity-50"
          >
            {applyCouponMutation.isPending ? "Applying..." : "Apply Code"}
          </button>
        </form>
      )}
    </div>
  )
}

export default CouponSection
