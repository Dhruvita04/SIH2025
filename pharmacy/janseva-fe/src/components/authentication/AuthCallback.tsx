"use client"

import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import useAuthFacade from "@/facades/useAuthFacade"
import { useMutation } from "@tanstack/react-query"
import toast from "react-hot-toast"
import axiosInstance from "@/utils/API"
import { GOOGLE_CALLBACK } from "@/CONFIG/api-routes"
import { HOME, LOGIN, CART, ORDER_PRESCRIPTION, ORDERS } from "@/CONFIG/routes"
import GoogleAuthLoader from "./GoogleAuthLoader"

interface Inputs {
  code: string
}

const AuthCallback = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const { storeLogin } = useAuthFacade()

  const googleSignInMutation = useMutation({
    mutationFn: (data: Inputs) => axiosInstance.post(GOOGLE_CALLBACK, { code: data.code }),
    onSuccess: (data) => {
      const {
        status,
        message,
        data: { user, accessToken },
      } = data.data

      if (status === "success") {
        storeLogin(
          {
            id: user?.id,
            name: user?.name,
            email: user?.email,
          },
          accessToken,
        )
        toast.success(message)

        const redirectAfterLogin = localStorage.getItem("redirectAfterLogin")

        if (redirectAfterLogin === "prescription") {
          localStorage.removeItem("redirectAfterLogin")
          navigate(ORDER_PRESCRIPTION)
        } else if (redirectAfterLogin === "cart") {
          localStorage.removeItem("redirectAfterLogin")
          navigate(CART)
        } else if (redirectAfterLogin === "orders") {
          localStorage.removeItem("redirectAfterLogin")
          navigate(ORDERS)
        } else {
          navigate(HOME)
        }
      } else {
        toast.error(message)
      }
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("An unexpected error occurred")
      }
    },
  })

  useEffect(() => {
    const query = new URLSearchParams(location.search)
    const code = query.get("code")

    if (code) {
      googleSignInMutation.mutate({ code })
    } else {
      toast.error("Something went wrong")
      navigate(LOGIN)
    }
  }, [])

  return <GoogleAuthLoader />
}

export default AuthCallback
