"use client"

import { PrescriptionSection } from "@/components/cart/PrescriptionSection"
import { ProgressTracker } from "@/components/checkout"
import { CART_REMOVE, CART_SYNC, CART_UPDATE_QUANTITY, CART_GET_DATA } from "@/CONFIG/api-routes"
import useAuthFacade from "@/facades/useAuthFacade"
import useCartFacade from "@/facades/useCartFacade"
import axiosInstance from "@/utils/API"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState, useCallback, useRef, useMemo } from "react"
import { toast } from "react-hot-toast"
import { Link, useLocation } from "react-router-dom"
import { steps } from "@/CONFIG/checkout"
import OrderSummaryCard from "@/components/cart/OrderSummaryCard"
import useCheckout from "@/hooks/useCheckout"
import type { Prescription } from "@/components/cart/types"

interface CartItem {
  id: string
  quantity: number
  productId: string
  variantId: string
}

interface LocalCartItem {
  id: string
  quantity: number
  cartItem: {
    productDetails: {
      id: string
      name: string
      brand: string
      images: string[]
      slug: string
    }
    currentOption: {
      id: string
      price: number
      discount?: number
      name?: string
    }
  }
  serverPricing?: {
    originalPrice: number
    discountedPrice: number
  }
}

function Cart() {
  const [currentStep] = useState(0)
  const { isAuthenticated, user } = useAuthFacade()
  const {
    cartItems,
    removeFromCart,
    updateCartQuantity,
    currentQuantityFromCart,
    prescription,
    prescriptionId,
    setPrescription,
    coupon,
    setCoupon,
    syncCartWithServer,
    updateCartPricing,
  } = useCartFacade()
  const { pathname: currentPath } = useLocation()
  const queryClient = useQueryClient()

  // Debounce refs for quantity updates
  const quantityUpdateTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({})
  const pendingQuantityUpdates = useRef<{
    [key: string]: { productId: string; variantId: string; newQuantity: number }
  }>({})

  // State to track if cart has prescription order and if toast was shown
  const [hasPrescriptionOrder, setHasPrescriptionOrder] = useState(false)
  const prescriptionToastShown = useRef(false)
  const lastSyncedCartHash = useRef<string>("")

  // Create a stable cart payload for the query key
  const cartPayload = useMemo(() => {
    return cartItems.map((ci: LocalCartItem) => ({
      productId: ci.cartItem.productDetails.id,
      quantity: ci.quantity,
      variantId: ci.cartItem.currentOption.id,
    }))
  }, [cartItems])

  // Proper React Query for cart sync
  const { data: serverCartData, error: cartSyncError } = useQuery({
    queryKey: ["cart-sync", user?.id, JSON.stringify(cartPayload), prescription?.id],
    queryFn: async () => {
      if (!user?.id || !isAuthenticated) {
        return null
      }

      const syncPayload: any = {
        userId: user.id,
        data: cartPayload,
      }

      // Include prescription ID if prescription exists
      if (prescription?.id) {
        syncPayload.prescriptionId = prescription.id
      }

      const response = await axiosInstance.post(CART_SYNC, syncPayload, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      return response.data
    },
    enabled: !!user?.id && isAuthenticated && cartPayload.length >= 0,
    refetchInterval: 60000, // Increase to 60 seconds to reduce API calls
    refetchIntervalInBackground: false, // Don't refetch in background
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: true,
    staleTime: 55000, // Consider data stale after 55 seconds
    retry: 2, // Reduce retry attempts
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  })

  // Fetch prescription details when prescriptionId is available and user is authenticated
  const { data: prescriptionData } = useQuery({
    queryKey: ["prescription", prescriptionId],
    queryFn: async () => {
      if (!prescriptionId || !isAuthenticated) return null
      const response = await axiosInstance.get(`/prescription/${prescriptionId}`)
      return response.data.data
    },
    enabled: !!prescriptionId && !prescription && isAuthenticated,
  })

  // Update prescription when data is fetched
  useEffect(() => {
    if (prescriptionData && !prescription && isAuthenticated) {
      const mappedPrescription: Prescription = {
        id: prescriptionData.id,
        userId: prescriptionData.userId,
        createdAt: prescriptionData.createdAt,
        updatedAt: prescriptionData.updatedAt,
        patientAge: prescriptionData.patientAge,
        patientBloodGroup: prescriptionData.patientBloodGroup,
        patientGender: prescriptionData.patientGender,
        patientHeight: prescriptionData.patientHeight,
        patientName: prescriptionData.patientName,
        patientWeight: prescriptionData.patientWeight,
        prescriptionUrl: prescriptionData.prescriptionUrl,
        doctorName: prescriptionData.doctorName,
        prescription: {
          url: prescriptionData.prescriptionUrl,
          path: prescriptionData.prescriptionUrl,
          hasError: prescriptionData.hasUrlError || false,
          errorMessage: prescriptionData.errorMessage || null,
        },
        status: "UPLOADED" as const,
        orderId: null,
        orderCreatedAt: null,
        rejectionReason: null,
        rejectionMessage: null,
      }
      setPrescription(mappedPrescription)
    }
  }, [prescriptionData, prescription, setPrescription, isAuthenticated])

  // Handle server cart data updates with duplicate prevention
  useEffect(() => {
    if (serverCartData?.data && isAuthenticated) {
      // Create hash of current server data to prevent duplicate processing
      const serverDataHash = JSON.stringify(serverCartData.data)

      // Only process if this is new data
      if (serverDataHash !== lastSyncedCartHash.current) {
        lastSyncedCartHash.current = serverDataHash

        // Check if response indicates prescription order and toast hasn't been shown
        if (
          serverCartData?.message === "Cart has prescription order, sync skipped" &&
          !prescriptionToastShown.current
        ) {
          setHasPrescriptionOrder(true)
          prescriptionToastShown.current = true
          toast.success("Your prescription has been approved! Medicines have been added to your cart.", {
            duration: 5000,
            icon: "🎉",
          })
        }

        // Only sync if the server data is actually different from local cart
        const serverCartItems: CartItem[] = Array.isArray(serverCartData.data) ? serverCartData.data : []
        const localCartItems: LocalCartItem[] = Array.isArray(cartItems) ? cartItems : []

        // Compare cart contents to avoid unnecessary syncs
        const serverItemsHash = JSON.stringify(
          serverCartItems
            .map((item: CartItem) => ({
              id: item.id,
              quantity: item.quantity,
              productId: item.productId,
              variantId: item.variantId,
            }))
            .sort((a: CartItem, b: CartItem) => a.id.localeCompare(b.id)),
        )

        const localItemsHash = JSON.stringify(
          localCartItems
            .map((item: LocalCartItem) => ({
              id: item.id,
              quantity: item.quantity,
              productId: item.cartItem.productDetails.id,
              variantId: item.cartItem.currentOption.id,
            }))
            .sort((a: any, b: any) => a.id.localeCompare(b.id)),
        )

        if (serverItemsHash !== localItemsHash) {
          syncCartWithServer(serverCartData.data)
        }
      }
    }
  }, [serverCartData, isAuthenticated]) // Remove syncCartWithServer from dependencies

  // Fetch cart data for non-logged-in users
  const { data: nonLoggedCartData } = useQuery({
    queryKey: ["cart-get-data", JSON.stringify(cartPayload)],
    queryFn: async () => {
      if (cartPayload.length === 0) return null

      const response = await axiosInstance.post(
        CART_GET_DATA,
        {
          data: cartPayload,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      return response.data
    },
    enabled: !isAuthenticated && cartPayload.length > 0,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 55000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  })

  useEffect(() => {
    if (serverCartData?.data?.products && isAuthenticated) {
      updateCartPricing(serverCartData.data.products)
    }
  }, [serverCartData, isAuthenticated, updateCartPricing])

  useEffect(() => {
    if (nonLoggedCartData?.data?.products && !isAuthenticated) {
      updateCartPricing(nonLoggedCartData.data.products)
    }
  }, [nonLoggedCartData, isAuthenticated, updateCartPricing])

  // Handle cart sync errors
  useEffect(() => {
    if (cartSyncError && isAuthenticated) {
      toast.error("Failed to sync cart with server")
    }
  }, [cartSyncError, isAuthenticated])

  // Mutations for cart operations
  const updateCartQuantityMutation = useMutation({
    mutationFn: (payload: any) => {
      return axiosInstance.put(CART_UPDATE_QUANTITY, payload)
    },
    onSuccess: () => {
      if (isAuthenticated) {
        // Invalidate cart sync query to trigger refetch
        queryClient.invalidateQueries({ queryKey: ["cart-sync", user?.id] })
      }
    },
    onError: () => {
      if (isAuthenticated) {
        toast.error("Failed to update cart item quantity")
      }
    },
  })

  const removeCartItemMutation = useMutation({
    mutationFn: (payload: any) => {
      return axiosInstance.delete(CART_REMOVE, {
        data: payload,
        headers: {
          "Content-Type": "application/json",
        },
      })
    },
    onSuccess: () => {
      if (isAuthenticated) {
        // Invalidate cart sync query to trigger refetch
        queryClient.invalidateQueries({ queryKey: ["cart-sync", user?.id] })
      }
    },
    onError: () => {
      if (isAuthenticated) {
        toast.error("Failed to remove cart item from server")
      }
    },
  })

  const handleRemoveFromCart = (currentCartItemId: string, productId: string, variantId: string) => {
    // ALWAYS remove from local cart first (works for both authenticated and non-authenticated users)
    removeFromCart(currentCartItemId)

    // Show success message for local removal
    toast.success("Item removed from cart")

    // Only call remove API if user is authenticated
    if (isAuthenticated && user?.id) {
      removeCartItemMutation.mutate({
        userId: user?.id,
        productId: productId,
        variantId: variantId,
      })
    }

    // Remove coupon when cart changes
    if (coupon) {
      setCoupon(null)
      toast.success("Coupon removed due to cart changes")
    }
  }

  const { handleCheckout } = useCheckout()

  // Debounced function to update quantity on server
  const debouncedQuantityUpdate = useCallback(
    (id: string, productId: string, variantId: string, newQuantity: number) => {
      if (!isAuthenticated || !user?.id) {
        return
      }

      // Clear existing timeout for this item
      if (quantityUpdateTimeouts.current[id]) {
        clearTimeout(quantityUpdateTimeouts.current[id])
      }

      // Store the pending update
      pendingQuantityUpdates.current[id] = { productId, variantId, newQuantity }

      // Set new timeout
      quantityUpdateTimeouts.current[id] = setTimeout(() => {
        const pendingUpdate = pendingQuantityUpdates.current[id]
        if (pendingUpdate && isAuthenticated && user?.id) {
          updateCartQuantityMutation.mutate({
            userId: user.id,
            productId: pendingUpdate.productId,
            variantId: pendingUpdate.variantId,
            quantity: pendingUpdate.newQuantity,
          })
        }

        // Clean up
        delete quantityUpdateTimeouts.current[id]
        delete pendingQuantityUpdates.current[id]
      }, 2000) // 2 seconds for quantity updates
    },
    [updateCartQuantityMutation, isAuthenticated, user?.id],
  )

  const handleQuantityChangeInCart = (id: string, productId: string, variantId: string, quantity: number) => {
    const currentQuantity = currentQuantityFromCart(id)
    const newQuantity = currentQuantity + quantity

    if (quantity < 0) {
      if (currentQuantity === 1) {
        handleRemoveFromCart(id, productId, variantId)
        return
      }
    }

    // ALWAYS update local state immediately (works for both authenticated and non-authenticated users)
    updateCartQuantity(id, quantity)

    // Remove coupon when cart quantity changes
    if (coupon) {
      setCoupon(null)
      toast.success("Coupon removed due to cart changes")
    }

    // Only debounce server update if user is authenticated
    if (isAuthenticated && user?.id) {
      debouncedQuantityUpdate(id, productId, variantId, newQuantity)
    }
  }

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("₹", "₹")
  }

  // Sort cart items alphabetically by product name
  const sortedCartItems = [...cartItems].sort((a: LocalCartItem, b: LocalCartItem) =>
    a.cartItem.productDetails.name.localeCompare(b.cartItem.productDetails.name),
  )

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(quantityUpdateTimeouts.current).forEach((timeout) => {
        clearTimeout(timeout)
      })
    }
  }, [])

  return (
    <section className="bg-white py-8 antialiased dark:bg-gray-900">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <ProgressTracker steps={steps} currentStep={currentStep} />

        {/* Prescription Approved Banner */}
        {hasPrescriptionOrder && prescription && (
          <div className="mt-6 rounded-lg border-2 border-green-200 bg-green-50 p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-800">🎉 Prescription Approved!</h3>
                <p className="mt-2 text-green-700">
                  Great news! Your prescription has been reviewed and approved by our pharmacy team. The recommended
                  medicines have been automatically added to your cart based on your prescription.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    👤 Patient: {prescription.patientName}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                    🩺 Dr. {prescription.doctorName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 sm:mt-8 lg:flex lg:items-start lg:gap-12 xl:gap-16">
          <div className="mx-auto w-full flex-none md:w-[70%]">
            <div className="space-y-6">
              <div className="min-h-[500px] space-y-6" style={{ overflow: "visible" }}>
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6M20 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0H4"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Add some products to get started</p>
                    <Link
                      to="/"
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-800 transition-colors"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                ) : (
                  sortedCartItems.map((ci: LocalCartItem) => {
                    const { cartItem, id: currentCartItemId, quantity: currentCartQuantity, serverPricing } = ci
                    const { productDetails, currentOption } = cartItem
                    const { id: productId, name, brand, images, slug } = productDetails
                    const { id: variantId, price, name: variantName } = currentOption

                    let originalPrice: number
                    let discountedPrice: number
                    let hasDiscount: boolean

                    if (serverPricing) {
                      // Use stored pricing data from local storage
                      originalPrice = serverPricing.originalPrice
                      discountedPrice = Number(serverPricing.discountedPrice.toFixed(2))
                      hasDiscount = originalPrice > discountedPrice
                    } else if (isAuthenticated && serverCartData?.data?.products) {
                      // Logged-in user: use server cart sync data as fallback
                      const serverProduct = serverCartData.data.products.find(
                        (p: any) => p.productId === productId && p.variantId === variantId,
                      )

                      if (serverProduct && serverProduct.pricing) {
                        originalPrice = serverProduct.pricing.originalPrice
                        discountedPrice = Number(serverProduct.pricing.discountedPrice.toFixed(2))
                        hasDiscount = originalPrice > discountedPrice
                      } else {
                        // Fallback to local data if server data not found
                        originalPrice = price
                        discountedPrice = price
                        hasDiscount = false
                      }
                    } else if (!isAuthenticated && nonLoggedCartData?.data?.products) {
                      // Non-logged-in user: use get-data API response as fallback
                      const serverProduct = nonLoggedCartData.data.products.find(
                        (p: any) => p.productId === productId && p.variantId === variantId,
                      )

                      if (serverProduct && serverProduct.pricing) {
                        originalPrice = serverProduct.pricing.originalPrice
                        discountedPrice = Number(serverProduct.pricing.discountedPrice.toFixed(2))
                        hasDiscount = originalPrice > discountedPrice
                      } else {
                        // Fallback to local data if server data not found
                        originalPrice = price
                        discountedPrice = price
                        hasDiscount = false
                      }
                    } else {
                      // Final fallback: use local data while waiting for server response
                      originalPrice = price
                      discountedPrice = price
                      hasDiscount = false
                    }

                    const totalOriginalPrice = originalPrice * currentCartQuantity
                    const totalDiscountedPrice = discountedPrice * currentCartQuantity
                    const totalSavings = (originalPrice - discountedPrice) * currentCartQuantity

                    return (
                      <div
                        className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                        key={currentCartItemId}
                        style={{
                          marginBottom: "2rem",
                          overflow: "visible",
                        }}
                      >
                        {/* Simple Savings Badge */}
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
                            SAVE {formatCurrency(totalSavings)}
                          </div>
                        )}

                        <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
                          {/* Product Image */}
                          <div className="shrink-0 md:order-1">
                            <img
                              className="h-40 w-40 object-cover rounded-xl shadow-lg border border-gray-100"
                              src={images[0] || "/placeholder.svg"}
                              alt={name}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/placeholder.svg"
                              }}
                            />
                          </div>

                          {/* Product Details */}
                          <div className="w-full min-w-0 flex-1 space-y-3 md:order-2 md:max-w-md">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3 flex-wrap">
                                <Link
                                  to={`/product/${slug}`}
                                  className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 leading-tight"
                                >
                                  {name}
                                </Link>

                                {variantName && (
                                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                    {variantName}
                                  </div>
                                )}
                              </div>

                              <p className="text-gray-600 text-base font-medium">by {brand}</p>

                              {currentCartQuantity > 1 && (
                                <p className="text-sm text-gray-600 font-medium">
                                  {formatCurrency(discountedPrice)} each
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between md:order-3 md:justify-end">
                            <div className="flex items-center border-2 border-gray-200 rounded-xl bg-gray-50">
                              <button
                                type="button"
                                onClick={() => {
                                  handleQuantityChangeInCart(currentCartItemId, productId, variantId, -1)
                                }}
                                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-l-xl border-r-2 border-gray-200 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                              >
                                <svg className="me-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                </svg>
                              </button>
                              <input
                                type="text"
                                className="w-16 shrink-0 border-0 bg-transparent text-center text-lg font-bold text-gray-900 focus:outline-none focus:ring-0"
                                value={currentCartQuantity}
                                readOnly
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  handleQuantityChangeInCart(currentCartItemId, productId, variantId, 1)
                                }}
                                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-r-xl border-l-2 border-gray-200 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                              >
                                <svg
                                  className="h-4 w-4 text-gray-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                  />
                                </svg>
                              </button>
                            </div>

                            {/* Enhanced Price Section */}
                            <div className="text-end md:order-4 md:w-48 ml-6">
                              <div className="space-y-1">
                                {/* Main Total Price */}
                                <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                  {formatCurrency(totalDiscountedPrice)}
                                </p>

                                {/* Original Price (only if there's a discount) */}
                                {hasDiscount && (
                                  <p className="text-lg text-gray-500 line-through font-medium">
                                    {formatCurrency(totalOriginalPrice)}
                                  </p>
                                )}
                              </div>

                              <div className="mt-4 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleRemoveFromCart(currentCartItemId, productId, variantId)
                                  }}
                                  className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                  title="Remove from cart"
                                >
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Always show prescription section for authenticated users */}
              {isAuthenticated && <PrescriptionSection prescriptionId={prescriptionId} />}
            </div>
          </div>

          <div className="mx-auto mt-6 space-y-6 lg:mt-0 md:w-[30%]">
            <OrderSummaryCard
              cartItems={cartItems}
              handleCheckout={handleCheckout}
              prescription={prescription}
              coupon={coupon}
              address={null}
              currentPath={currentPath}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Cart
