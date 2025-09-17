"use client"

import { ProgressTracker } from "@/components/checkout"
import { steps } from "@/CONFIG/checkout"
import { Link, useNavigate, useLocation } from "react-router-dom"
import useCartFacade from "@/facades/useCartFacade"
import useAuthFacade from "@/facades/useAuthFacade"
import { getPriceBasedOnDiscountType } from "@/utils/helperFunctions"
import OrderSummaryCard from "@/components/cart/OrderSummaryCard"
import useCheckout from "@/hooks/useCheckout"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/utils/API"
import { ADDRESS } from "@/CONFIG/api-routes"
import type { Address } from "@/types"
import { useAddress } from "@/store/useAddress"

function OrderSummary() {
  const navigate = useNavigate()
  const { user } = useAuthFacade()
  const { cartItems, prescription, coupon } = useCartFacade()
  const { handleCheckout } = useCheckout()
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const { addressId } = useAddress()
  const location = useLocation()

  const { data: addresses = [] } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const response = await axiosInstance.get(`${ADDRESS}/${user?.id}`)
      return response.data.data
    },
    enabled: !!user?.id,
  })

  useEffect(() => {
    if (addresses.length > 0) {
      let addressToSelect: Address | null = null

      // First, try to find the address that was selected on the Address page
      if (addressId) {
        addressToSelect = addresses.find((addr: Address) => addr.id === addressId) || null
      }

      // If no specific address was selected, use the default address or the first one
      if (!addressToSelect) {
        addressToSelect = addresses.find((addr: Address) => addr.default) || addresses[0]
      }

      setSelectedAddress(addressToSelect)
    }
  }, [addresses, addressId])

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart")
    }
  }, [cartItems, navigate])

  return (
    <section className="bg-white py-8 antialiased dark:bg-gray-900">
      <div className="px-4 md:px-[20px] max-w-screen-xl mx-auto">
        <ProgressTracker steps={steps} currentStep={2} />

        <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
          <div className="mx-auto w-full flex-none md:w-[70%]">
            <div className="space-y-6">
              {/* Shipping Address Section */}
              {selectedAddress && (
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Shipping Address</h3>
                    <Link
                      to="/address"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                    >
                      Change
                    </Link>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 space-y-1">
                    <p className="font-medium text-gray-900 dark:text-white">{selectedAddress.name}</p>
                    <p>
                      <span className="font-medium">Phone:</span> {selectedAddress.phone}
                    </p>
                    <p>{selectedAddress.line1}</p>
                    {selectedAddress.line2 && <p>{selectedAddress.line2}</p>}
                    <p>
                      {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}
                    </p>
                  </div>
                </div>
              )}

              {/* Cart Items */}
              {cartItems.map((ci) => {
                const { cartItem, id: currentCartItemId, quantity: currentCartQuantity } = ci
                const { productDetails, currentOption } = cartItem
                const { name, brand, images, slug } = productDetails
                const { price, discount, discountType, name: variantName } = currentOption
                const itemPrice = getPriceBasedOnDiscountType(price, discount, discountType)
                const totalItemPrice = Number(itemPrice) * currentCartQuantity

                const hasDiscount = discount > 0
                const totalSavings = hasDiscount ? (Number(price) - Number(itemPrice)) * currentCartQuantity : 0

                return (
                  <div
                    className="relative rounded-xl border border-blue-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 dark:border-blue-800 dark:bg-gray-800"
                    key={currentCartItemId}
                    style={{ overflow: "visible" }}
                  >
                    {hasDiscount && (
                      <div
                        className="absolute text-white px-3 py-1 rounded-md text-sm font-semibold shadow-lg"
                        style={{
                          backgroundColor: "#14317b",
                          top: "-8px",
                          right: "-8px",
                          zIndex: 1,
                        }}
                      >
                        SAVE ₹{totalSavings.toLocaleString()}
                      </div>
                    )}

                    <div className="flex items-center gap-6">
                      {/* Product Image - professional styling */}
                      <div className="shrink-0">
                        <img
                          className="h-24 w-24 object-cover rounded-lg shadow-md border-2 border-blue-200 dark:border-blue-700"
                          src={images[0] || "/placeholder.svg"}
                          alt={name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg"
                          }}
                        />
                      </div>

                      {/* Product Details - clean professional layout */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <Link
                              to={`/product/${slug}`}
                              className="text-lg font-semibold text-blue-900 hover:text-blue-700 transition-colors line-clamp-2 dark:text-blue-100"
                            >
                              {name}
                            </Link>

                            {variantName && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-800 dark:text-blue-100 dark:border-blue-700">
                                {variantName}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">by {brand}</p>
                        </div>
                      </div>

                      {/* Quantity and Price - professional right-aligned layout */}
                      <div className="text-right space-y-2">
                        <div className="flex items-center justify-end gap-2 text-sm text-blue-700 dark:text-blue-300 pt-2">
                          <span>Qty:</span>
                          <span className="font-semibold text-blue-900 dark:text-blue-100">{currentCartQuantity}</span>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                            ₹{totalItemPrice.toLocaleString()}
                          </p>
                          {discount > 0 && (
                            <div className="space-y-1">
                              <p className="text-sm text-blue-500 line-through dark:text-blue-400">
                                ₹{(Number(price) * currentCartQuantity).toLocaleString()}
                              </p>
                              {currentCartQuantity > 1 && (
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                  ₹{Number(price).toLocaleString()} each
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Prescription Section */}
              {prescription && (
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Prescription</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-gray-600 dark:text-gray-400">Prescription has been uploaded successfully</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mx-auto mt-6 flex-1 space-y-6 lg:mt-0 md:w-[30%]">
            <OrderSummaryCard
              cartItems={cartItems}
              handleCheckout={handleCheckout}
              prescription={prescription}
              coupon={coupon}
              address={selectedAddress}
              currentPath={location.pathname}
              isAuthenticated={!!user}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default OrderSummary
