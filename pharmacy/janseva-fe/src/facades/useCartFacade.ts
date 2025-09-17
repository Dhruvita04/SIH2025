import useCart from "@/store/useCart"

const useCartFacade = () => {
  const {
    id: cartId,
    setCartId,
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    generateCartId,
    updateCartQuantity,
    currentQuantityFromCart,
    setPrescription,
    prescription,
    prescriptionId,
    setPrescriptionId,
    coupon,
    setCoupon,
    syncCartWithServer,
    updateCartPricing,
  } = useCart()

  return {
    cartId,
    cartItems,
    setCartId,
    addToCart,
    removeFromCart,
    clearCart,
    generateCartId,
    updateCartQuantity,
    currentQuantityFromCart,
    setPrescription,
    prescription,
    prescriptionId,
    setPrescriptionId,
    coupon,
    setCoupon,
    syncCartWithServer,
    updateCartPricing,
  }
}

export default useCartFacade
