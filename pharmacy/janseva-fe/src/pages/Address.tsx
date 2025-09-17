"use client"

import { ProgressTracker } from "@/components/checkout"
import { steps } from "@/CONFIG/checkout"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axiosInstance from "@/utils/API"
import { ADDRESS } from "@/CONFIG/api-routes"
import useAuthFacade from "@/facades/useAuthFacade"
import { useState, useEffect } from "react"
import { HomeIcon, PlusIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Checkbox } from "@/components/ui/checkbox"
import toast from "react-hot-toast"
import OrderSummaryCard from "@/components/cart/OrderSummaryCard"
import useCartFacade from "@/facades/useCartFacade"
import useCheckout from "@/hooks/useCheckout"
import CouponSection from "@/components/cart/CouponSection"
import type { Address } from "@/types"
import { useAddress } from "@/store/useAddress"
import { useLocation } from "react-router-dom"

const addressSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone number is required"),
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  default: z.boolean().default(false),
})

type AddressFormData = z.infer<typeof addressSchema>

function AddressComponent() {
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const { addressId, setAddressId } = useAddress()
  const { user } = useAuthFacade()
  const queryClient = useQueryClient()
  const { cartItems, prescription, coupon } = useCartFacade()
  const { handleCheckout } = useCheckout()

  const { pathname: currentPath } = useLocation()
  const { isAuthenticated } = useAuthFacade()

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const response = await axiosInstance.get(`${ADDRESS}/${user?.id}`)
      return response.data.data
    },
    enabled: !!user?.id,
  })

  // Set default address as selected when addresses are loaded
  useEffect(() => {
    if (addresses.length > 0) {
      // If we have a stored addressId, use that
      if (addressId) {
        const storedAddress = addresses.find((address: Address) => address.id === addressId)
        if (storedAddress) {
          setSelectedAddressId(storedAddress.id)
          return;
        }
      }
      
      // Otherwise, use default address or first address
      if (!selectedAddressId) {
        const defaultAddress = addresses.find((address: Address) => address.default)
        const addressToSelect = defaultAddress || addresses[0]
        if (addressToSelect) {
          setSelectedAddressId(addressToSelect.id)
          setAddressId(addressToSelect.id)
        }
      }
    }
  }, [addresses, selectedAddressId, addressId, setAddressId])

  const addMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      return axiosInstance.post(ADDRESS, { ...data, userId: user?.id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
      toast.success("Address added successfully")
      setIsAddressDialogOpen(false)
    },
    onError: () => {
      toast.error("Failed to add address")
    },
  })

  const updateDefaultMutation = useMutation({
    mutationFn: async (addressId: string) => {
      return axiosInstance.put(`${ADDRESS}/default/${addressId}`, { userId: user?.id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
      toast.success("Default address updated")
    },
    onError: () => {
      toast.error("Failed to update default address")
    },
  })

  const handleAddAddress = (data: AddressFormData) => {
    addMutation.mutate(data)
  }

  const handleSetDefaultAddress = (addressId: string) => {
    updateDefaultMutation.mutate(addressId)
  }

  const handleSetAddressId = (addressId: string) => {
    setSelectedAddressId(addressId)
    setAddressId(addressId)
  }

  // Find the selected address from the addresses array
  const selectedAddress = addresses.find((address: Address) => address.id === selectedAddressId) || null

  return (
    <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <ProgressTracker steps={steps} currentStep={1} />

        <div className="mt-6 sm:mt-8 lg:flex lg:items-start lg:gap-12 xl:gap-16">
          <div className="min-w-0 md:w-[70%] space-y-8 ">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Your Address</h3>
                <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusIcon className="mr-2 h-4 w-4" /> Add New Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Address</DialogTitle>
                    </DialogHeader>
                    <AddAddressForm onSubmit={handleAddAddress} isLoading={addMutation.isPending} />
                  </DialogContent>
                </Dialog>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-gray-500">No addresses found. Please add an address.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {addresses.map((address: Address) => (
                    <div
                      key={address.id}
                      onClick={() => handleSetAddressId(address.id)}
                      className={`group cursor-pointer rounded-lg border transition-all duration-200 hover:shadow-lg
                                              ${selectedAddressId === address.id ? "border-primary border-[2px] bg-primary/5 shadow-md" : "border-gray-200 bg-white hover:border-gray-300"} 
                                              p-4 ps-4 dark:border-gray-700 dark:bg-gray-800 relative overflow-hidden min-h-[174px]`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="selected-address"
                          checked={selectedAddressId === address.id}
                          onChange={() => handleSetAddressId(address.id)}
                          className="mt-1 h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                        />

                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{address.name}</h4>
                            {address.default && (
                              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full font-medium">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <span className="font-medium">Phone:</span> {address.phone}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {address.line1}
                            {address.line2 && `, ${address.line2}`}
                            <br />
                            {address.city}, {address.state} {address.postalCode}
                          </p>

                          {!address.default && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSetDefaultAddress(address.id)
                              }}
                              className="mt-3 inline-flex items-center gap-1.5 text-sm bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
                              type="button"
                            >
                              Make Default
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mx-auto mt-6 space-y-6 lg:mt-0 md:w-[30%]">
            <OrderSummaryCard
              cartItems={cartItems}
              handleCheckout={handleCheckout}
              prescription={prescription}
              coupon={coupon}
              address={selectedAddress}
              currentPath={currentPath}
              isAuthenticated={isAuthenticated}
            />

            <CouponSection />
          </div>
        </div>
      </div>
    </section>
  )
}

const AddAddressForm = ({ onSubmit, isLoading }: { onSubmit: (data: AddressFormData) => void; isLoading: boolean }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" {...register("name")} placeholder="Enter your full name" />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" {...register("phone")} placeholder="Enter your phone number" />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
      </div>
      <div>
        <Label htmlFor="line1">Address Line 1</Label>
        <Input id="line1" {...register("line1")} placeholder="Street address, P.O. box, company name" />
        {errors.line1 && <p className="text-red-500 text-sm mt-1">{errors.line1.message}</p>}
      </div>
      <div>
        <Label htmlFor="line2">Address Line 2 (Optional)</Label>
        <Input id="line2" {...register("line2")} placeholder="Apartment, suite, unit, building, floor, etc." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} placeholder="Enter city" />
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input id="state" {...register("state")} placeholder="Enter state" />
          {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="postalCode">Postal Code</Label>
        <Input id="postalCode" {...register("postalCode")} placeholder="Enter postal code" />
        {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>}
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="default"
          checked={watch("default")}
          onCheckedChange={(checked: boolean) => setValue("default", checked)}
        />
        <Label htmlFor="default">Set as default address</Label>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Address"}
      </Button>
    </form>
  )
}

export default AddressComponent
