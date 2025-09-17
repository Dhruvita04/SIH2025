import { ADDRESS, LOGIN, ORDER_SUMMARY, PAYMENT } from "@/CONFIG/routes"
import useAuthFacade from "@/facades/useAuthFacade"
import { useLocation, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import type { Prescription, Coupon } from "@/components/cart/types"
import type { Address } from "@/types"

function useCheckout() {
  const { isAuthenticated } = useAuthFacade()
  const navigate = useNavigate()
  const { pathname: currentPath } = useLocation()

  const handleCheckout = (prescription: Prescription | null, coupon: Coupon | null, address: Address | null) => {
    console.log("Checkout called with:", { prescription, coupon, address, currentPath })

    if (!isAuthenticated) {
      localStorage.setItem("redirectAfterLogin", "cart")
      navigate(`${LOGIN}?redirect=cart`)
      return
    }

    if (currentPath.includes("cart")) {
      if (!prescription) {
        toast.error("Please select a prescription")
        return
      }
      navigate(ADDRESS)
    } else if (currentPath.includes("address")) {
      if (!address) {
        toast.error("Please select an address")
        return
      }
      navigate(ORDER_SUMMARY)
    } else if (currentPath.includes("summary")) {
      if (!address) {
        toast.error("Please select an address")
        return
      }
      navigate(PAYMENT)
    }
  }

  return { handleCheckout }
}

export default useCheckout
