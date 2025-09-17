"use client"

import { CART, FORGOTPASSWORD, SIGNUP, VERIFYACCOUNT, ORDER_PRESCRIPTION, ORDERS } from "@/CONFIG/routes"
import { ErrorMessage } from "@/components/authentication"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import { zodResolver } from "@hookform/resolvers/zod"
import { type MouseEvent, useCallback, useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/utils/API"
import { LOGIN as LOGIN_API } from "@/CONFIG/api-routes"
import useAuthFacade from "@/facades/useAuthFacade"
import toast from "react-hot-toast"
import Loader from "@/components/Loader"
import GoogleIcon from "@/components/icons/GoogleIcon"
import useGoogleSignIn from "@/hooks/authentication/useGoogleSignIn"

// Define the Zod schema for validation
const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

type Inputs = z.infer<typeof schema>

const Login = () => {
  const { storeLogin, user, setUser } = useAuthFacade()
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  // get redirect from url
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get("redirect")

  const { handleGoogleSignIn } = useGoogleSignIn(user, navigate)

  const handlePasswordVisibility = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setShowPassword((prev) => !prev)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  })

  const loginMutation = useMutation({
    mutationFn: (data: Inputs) => axiosInstance.post(LOGIN_API, data),
    onSuccess: (response) => {
      const { data: responseData } = response
      const { status, message, data } = responseData

      if (status === "success") {
        // Successful login
        const { user, accessToken } = data
        storeLogin(user, accessToken)
        toast.success(message || "Login successful")

        // Handle navigation
        if (redirect) {
          if (redirect === "cart") {
            navigate(CART)
          } else {
            navigate(redirect)
          }
        } else {
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
            navigate("/")
          }
        }
      } else if (status === "error") {
        // Handle different error types
        if (data?.type === "REGISTRATION") {
          // Account not verified - need to go to verify page
          // Store user email for verification
          const formValues = getValues()
          const userEmail = data.user?.email || formValues.email
          setUser({
            id: "",
            name: "",
            email: userEmail,
          })
          toast.error(message)
          navigate(VERIFYACCOUNT)
        } else {
          // Other login errors
          toast.error(message || "Login failed")

          // Set form errors for invalid credentials
          if (message?.toLowerCase().includes("invalid") || message?.toLowerCase().includes("incorrect")) {
            setError("email", { message: "Invalid credentials" })
            setError("password", { message: "Invalid credentials" })
          }
        }
      }
    },
    onError: (error: any) => {
      console.error("Login mutation error:", error)

      let errorMessage = "An error occurred during login"

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error?.message) {
        errorMessage = error.message
      }

      toast.error(errorMessage)

      // Set form errors if needed
      if (error?.response?.status === 401) {
        setError("email", { message: "Invalid credentials" })
        setError("password", { message: "Invalid credentials" })
      }
    },
  })

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    loginMutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mx-auto grid w-[350px] md:w-[450px] gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold md:text-left">Login</h1>
        <p className="text-balance text-muted-foreground md:text-left">Login to your account to get started</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            {...register("email", { required: true })}
          />
          {errors.email && <ErrorMessage message={errors.email.message || ""} />}
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link to={FORGOTPASSWORD} className="ml-auto inline-block text-sm underline">
              Forgot your password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              placeholder="********"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              {...register("password", { required: true })}
            />
            <button
              type="button"
              onClick={handlePasswordVisibility}
              className="top-1/2 -translate-y-1/2 right-[16px] absolute"
            >
              {showPassword ? <EyeSlashIcon height={18} width={18} /> : <EyeIcon height={18} width={18} />}
            </button>
          </div>
          {errors.password && <ErrorMessage message={errors.password.message || ""} />}
        </div>
        <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? <Loader /> : "Sign In"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={(e) => {
            e.preventDefault()
            handleGoogleSignIn(e)
          }}
          className="w-full flex items-center gap-2"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <Loader />
          ) : (
            <>
              <GoogleIcon height={16} width={16} />
              <p>Signin with Google</p>
            </>
          )}
        </Button>
      </div>
      <div className="mt-4 text-center text-sm">
        Don't have an account?{" "}
        <Link to={SIGNUP} className="underline">
          Sign up
        </Link>
      </div>
    </form>
  )
}

export default Login
