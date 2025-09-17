"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HomeIcon, PlusIcon, Pencil, Trash2, StarIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import axiosInstance from "@/utils/API"
import { ADDRESS } from "@/CONFIG/api-routes"
import useAuthFacade from "@/facades/useAuthFacade"
import { Checkbox } from "@/components/ui/checkbox"

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

interface Address extends AddressFormData {
  id: number
}

export default function ManageAddress() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const queryClient = useQueryClient()
  const { user } = useAuthFacade()

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const response = await axiosInstance.get(`${ADDRESS}/${user?.id}`)
      return response.data.data
    },
    enabled: !!user?.id,
  })

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

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AddressFormData }) => {
      return axiosInstance.put(`${ADDRESS}/${id}`, { ...data, userId: user?.id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
      toast.success("Address updated successfully")
      setSelectedAddress(null)
      setIsEditMode(false)
      setIsAddressDialogOpen(false)
    },
    onError: () => {
      toast.error("Failed to update address")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return axiosInstance.delete(`${ADDRESS}/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
      toast.success("Address deleted successfully")
      setIsDeleteDialogOpen(false)
    },
    onError: () => {
      toast.error("Failed to delete address")
    },
  })

  const setDefaultMutation = useMutation({
    mutationFn: async (id: number) => {
      return axiosInstance.put(`${ADDRESS}/default/${id}`, { userId: user?.id })
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

  const handleEditAddress = (address: Address) => {
    setSelectedAddress(address)
    setIsEditMode(true)
    setIsAddressDialogOpen(true)
  }

  const handleUpdateAddress = (data: AddressFormData) => {
    if (selectedAddress) {
      updateMutation.mutate({ id: selectedAddress.id, data })
    }
  }

  const handleDeleteClick = (address: Address) => {
    setSelectedAddress(address)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedAddress) {
      deleteMutation.mutate(selectedAddress.id)
    }
  }

  const handleSetDefault = (address: Address) => {
    setDefaultMutation.mutate(address.id)
  }

  const handleDialogClose = () => {
    setIsAddressDialogOpen(false)
    setIsEditMode(false)
    setSelectedAddress(null)
  }

  if (isLoading) {
    return <div>Loading addresses...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Manage Addresses</h1>
      <p className="text-base text-muted-foreground mb-4">
        Your saved addresses are listed below. You can add new addresses or manage existing ones.
      </p>

      <div className="flex justify-end mb-6">
        <AddAddress
          onAddAddress={handleAddAddress}
          editAddress={selectedAddress}
          isEditMode={isEditMode}
          onUpdateAddress={handleUpdateAddress}
          isLoading={addMutation.isPending || updateMutation.isPending}
          isOpen={isAddressDialogOpen}
          onOpenChange={setIsAddressDialogOpen}
          onClose={handleDialogClose}
        />
      </div>

      <div>
        {addresses.length === 0 && (
          <div className="flex justify-center items-center h-[20vh]">
            <div className="text-center px-4">
              <h1 className="text-2xl font-bold">No addresses found</h1>
              <p className="text-base text-muted-foreground">Add a new address to get started.</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {addresses &&
          addresses?.map((address: Address) => (
            <div
              key={address.id}
              className={`flex flex-col md:flex-row md:items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors gap-4 ${
                address.default ? "border-2 border-primary" : ""
              }`}
            >
              <div className="flex items-start md:items-center space-x-4 flex-1 min-w-0">
                <div className="bg-primary p-2 rounded-full flex-shrink-0">
                  <HomeIcon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <h3 className="font-semibold text-base truncate">{address.name}</h3>
                    {address.default && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full w-fit">Default</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{address.phone}</p>
                  <p className="text-sm text-muted-foreground break-words">
                    {address.line1}
                    {address.line2 && `, ${address.line2}`}, {address.city}, {address.state} {address.postalCode}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-end md:justify-start">
                {!address.default && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm px-3 bg-transparent"
                    onClick={() => handleSetDefault(address)}
                    disabled={setDefaultMutation.isPending}
                  >
                    <StarIcon className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Make Default</span>
                    <span className="sm:hidden">Default</span>
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="p-2" onClick={() => handleEditAddress(address)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2" onClick={() => handleDeleteClick(address)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the address.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface AddAddressProps {
  onAddAddress: (data: AddressFormData) => void
  onUpdateAddress: (data: AddressFormData) => void
  editAddress: Address | null
  isEditMode: boolean
  isLoading: boolean
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
}

const AddAddress: React.FC<AddAddressProps> = ({
  onAddAddress,
  onUpdateAddress,
  editAddress,
  isEditMode,
  isLoading,
  isOpen,
  onOpenChange,
  onClose,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    values: editAddress || undefined,
  })

  const onSubmit = (data: AddressFormData) => {
    if (isEditMode) {
      onUpdateAddress(data)
    } else {
      onAddAddress(data)
    }
    reset()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={isLoading} className="text-sm px-4" onClick={() => reset()}>
          <PlusIcon className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Add New Address</span>
          <span className="sm:hidden">Add Address</span>
        </Button>
      </DialogTrigger>
      <DialogContent onInteractOutside={onClose} className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{isEditMode ? "Edit Address" : "Add New Address"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm">
              Full Name
            </Label>
            <Input id="name" {...register("name")} placeholder="Full Name" className="text-sm" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="phone" className="text-sm">
              Phone Number
            </Label>
            <Input id="phone" {...register("phone")} placeholder="Phone Number" className="text-sm" />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <Label htmlFor="line1" className="text-sm">
              Address Line 1
            </Label>
            <Input
              id="line1"
              {...register("line1")}
              placeholder="Street address, P.O. box, company name"
              className="text-sm"
            />
            {errors.line1 && <p className="text-red-500 text-xs mt-1">{errors.line1.message}</p>}
          </div>
          <div>
            <Label htmlFor="line2" className="text-sm">
              Address Line 2
            </Label>
            <Input
              id="line2"
              {...register("line2")}
              placeholder="Apartment, suite, unit, building, floor, etc."
              className="text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="city" className="text-sm">
                City
              </Label>
              <Input id="city" {...register("city")} placeholder="City" className="text-sm" />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <Label htmlFor="state" className="text-sm">
                State
              </Label>
              <Input id="state" {...register("state")} placeholder="State" className="text-sm" />
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="postalCode" className="text-sm">
              Postal Code
            </Label>
            <Input id="postalCode" {...register("postalCode")} placeholder="Postal Code" className="text-sm" />
            {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="default"
              checked={watch("default")}
              onCheckedChange={(checked: boolean) => setValue("default", checked)}
            />
            <Label htmlFor="default" className="text-sm">
              Set as default address
            </Label>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Loading..." : isEditMode ? "Update Address" : "Add Address"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
