import type { Prescription } from "@/components/cart/types"
import type { ProductDetails, ProductVariation } from "@/components/singleProduct/types"
import { create } from "zustand"
import { createJSONStorage, devtools, persist } from "zustand/middleware"

interface CartItem {
  id: string
  quantity: number
  cartItem: {
    productDetails: ProductDetails
    currentOption: ProductVariation
  }
  serverPricing?: {
    originalPrice: number
    discountedPrice: number
  }
}

interface Coupon {
  discountType: string
  discountValue: string
  minPurchaseAmount: string
  code: string
}

interface CartState {
  id: string | null
  cartItems: CartItem[]
  prescription: Prescription | null
  prescriptionId: string | null
  setCartId: (id: string) => void
  addToCart: (cartItem: CartItem) => void
  updateCartQuantity: (id: string, quantity: number) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  clearCartProducts: () => void
  generateCartId: () => string
  currentQuantityFromCart: (id: string) => number
  setPrescription: (prescription: Prescription) => void
  setPrescriptionId: (prescriptionId: string | null) => void
  coupon: Coupon | null
  setCoupon: (coupon: Coupon | null) => void
  syncCartWithServer: (serverData: any) => void
  updateCartPricing: (pricingData: any[]) => void
}

const useCart = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        id: null,
        cartItems: [],
        prescription: null,
        prescriptionId: null,
        setCartId: (id: string) => set({ id }),
        addToCart: (cartItem: CartItem) =>
          set((state) => {
            // Check if the exact same product variant combination is already in the cart
            const existingItemIndex = state.cartItems.findIndex(
              (item) =>
                item.cartItem.productDetails.slug === cartItem.cartItem.productDetails.slug &&
                item.cartItem.currentOption.id === cartItem.cartItem.currentOption.id,
            )

            if (existingItemIndex !== -1) {
              // If exact variant exists, update quantity instead of adding new item
              const updatedCartItems = [...state.cartItems]
              updatedCartItems[existingItemIndex] = {
                ...updatedCartItems[existingItemIndex],
                quantity: updatedCartItems[existingItemIndex].quantity + cartItem.quantity,
              }
              return { cartItems: updatedCartItems }
            } else {
              // If it's a new product-variant combination, add it to cart
              return { cartItems: [...state.cartItems, cartItem] }
            }
          }),
        updateCartQuantity: (id: string, quantity: number) =>
          set((state) => ({
            cartItems: state.cartItems.map((item) => {
              const updatedQuantity = item.quantity + quantity
              return item.id === id ? { ...item, quantity: updatedQuantity } : item
            }),
          })),
        removeFromCart: (id: string) =>
          set((state) => ({ cartItems: state.cartItems.filter((item) => item.id !== id) })),
        clearCart: () => set({ cartItems: [], prescription: null, coupon: null, prescriptionId: null }),
        clearCartProducts: () => set({ cartItems: [], coupon: null }), // New method that keeps prescription
        generateCartId: () => {
          const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
          return id
        },
        currentQuantityFromCart: (id: string) => {
          const currentIdQuantity: number = get().cartItems.find((item: CartItem) => item.id === id)?.quantity ?? 0
          return currentIdQuantity
        },
        setPrescription: (prescription: Prescription) =>
          set(() => {
            return { prescription }
          }),
        setPrescriptionId: (prescriptionId: string | null) =>
          set(() => {
            return { prescriptionId }
          }),
        coupon: null,
        setCoupon: (coupon: Coupon | null) =>
          set(() => {
            return { coupon }
          }),
        syncCartWithServer: (serverData: any) => {
          set((state) => {
            // Create new cart items based on server data
            const newCartItems: CartItem[] = serverData.products.map((serverProduct: any) => {
              // Generate a unique ID for this cart item (productId + variantId)
              const cartItemId = `${serverProduct.productId}_${serverProduct.variantId}`

              return {
                id: cartItemId,
                quantity: serverProduct.quantity,
                cartItem: {
                  productDetails: {
                    id: serverProduct.productId,
                    name: serverProduct.name,
                    brand: serverProduct.brand,
                    slug: serverProduct.name.toLowerCase().replace(/\s+/g, "-"),
                    images: [serverProduct.image || "/placeholder.svg"], // Use server image
                    description: "",
                    categoryId: "",
                    brandId: "",
                    tags: [],
                    variants: [],
                  },
                  currentOption: {
                    id: serverProduct.variantId,
                    productId: serverProduct.productId,
                    name: serverProduct.variant.name,
                    price: serverProduct.pricing.originalPrice,
                    stock: 100,
                    units: serverProduct.variant.units,
                    discount: serverProduct.pricing.originalPrice - serverProduct.pricing.discountedPrice,
                    discountType: "FLAT",
                  },
                },
                serverPricing: {
                  originalPrice: serverProduct.pricing.originalPrice,
                  discountedPrice: serverProduct.pricing.discountedPrice,
                },
              }
            })

            return {
              ...state,
              cartItems: newCartItems,
              prescriptionId: serverData.prescriptionId || null,
              id: serverData.cartId,
            }
          })
        },

        updateCartPricing: (pricingData: any[]) => {
          set((state) => {
            const updatedCartItems = state.cartItems.map((cartItem) => {
              // Find matching pricing data from server
              const pricingInfo = pricingData.find(
                (item) =>
                  item.productId === cartItem.cartItem.productDetails.id &&
                  item.variantId === cartItem.cartItem.currentOption.id,
              )

              if (pricingInfo) {
                return {
                  ...cartItem,
                  serverPricing: {
                    originalPrice: pricingInfo.pricing.originalPrice,
                    discountedPrice: pricingInfo.pricing.discountedPrice,
                  },
                }
              }

              return cartItem
            })

            return {
              ...state,
              cartItems: updatedCartItems,
            }
          })
        },
      }),
      {
        name: "cart-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state: CartState) => ({
          cartItems: state.cartItems,
          prescription: state.prescription,
          prescriptionId: state.prescriptionId,
          coupon: state.coupon,
        }),
      },
    ),
  ),
)

export default useCart
