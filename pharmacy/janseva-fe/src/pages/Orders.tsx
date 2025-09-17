"use client"

import OrderCard from "@/components/orders/OrderCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/utils/API"
import { ORDERS } from "@/CONFIG/api-routes"
import useAuthFacade from "@/facades/useAuthFacade"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, Loader2Icon } from "lucide-react"

interface Order {
  id: string
  orderId: string
  orderNumber: string
  prescriptionId: string
  userId: string
  date: string
  status: string
  shippingAddressId: string
  couponId: string | null
  subTotal: number
  discount: number
  couponDiscount: number
  shipping: number
  cgst: number
  sgst: number
  igst: number
  orderTotal: number
  createdAt: string
  updatedAt: string
  shippingDetailsId: string | null
  user: {
    id: string
    name: string
    email: string
    phone: string | null
  }
  shippingAddress: {
    id: string
    userId: string
    name: string
    phone: string
    line1: string
    line2: string
    city: string
    state: string
    postalCode: string
    default: boolean
    createdAt: string
    updatedAt: string
  }
  payment: {
    id: string
    method: string
    gateway: string
    status: string
    transactionId: string | null
    gatewayOrderId: string
    paymentSessionId: string
    amount: number
    currency: string
    paymentDate: string | null
    confirmationDate: string | null
    errorMessage: string | null
    isRefunded: boolean
    refundDate: string | null
  }
  estimatedDeliveryDate: string
  userActions: {
    canCancel: boolean
    canReturn: boolean
    canRetryPayment: boolean
  }
}

interface OrdersResponse {
  status: string
  message: string
  data: {
    orders: Order[]
    pagination: {
      total: number
      page: string
      limit: number
      totalPages: number
    }
  }
}

// Order status options for the dropdown
const ORDER_STATUS_OPTIONS = [
  { value: "all", label: "All Orders", color: "bg-gray-100" },
  { value: "PLACED", label: "Placed", color: "bg-blue-100" },
  { value: "SHIPPED", label: "Shipped", color: "bg-purple-100" },
  { value: "IN_TRANSIT", label: "In Transit", color: "bg-yellow-100" },
  { value: "DELIVERED", label: "Delivered", color: "bg-green-100" },
  { value: "RETURNED", label: "Returned", color: "bg-orange-100" },
  { value: "REFUNDED", label: "Refunded", color: "bg-gray-100" },
  { value: "PAYMENT_FAILED", label: "Payment Failed", color: "bg-red-100" },
  { value: "PAYMENT_PENDING", label: "Payment Pending", color: "bg-yellow-100" },
]

function Orders() {
  const { user } = useAuthFacade()
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const pageSize = 10

  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery<OrdersResponse>({
    queryKey: ["orders", user?.id, currentPage, selectedStatus],
    queryFn: async () => {
      let url = `${ORDERS}/user?page=${currentPage}&limit=${pageSize}`
      if (selectedStatus) {
        url += `&status=${selectedStatus}`
      }
      const response = await axiosInstance.get(url)
      return response.data
    },
    enabled: !!user?.id,
  })

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status === "all" ? null : status)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const handleNextPage = () => {
    if (ordersData && currentPage < ordersData.data.pagination.totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const handlePageClick = (page: number) => {
    setCurrentPage(page)
  }

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    if (!ordersData) return []

    const totalPages = ordersData.data.pagination.totalPages
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show pages with ellipsis logic
      const startPage = Math.max(1, currentPage - 2)
      const endPage = Math.min(totalPages, currentPage + 2)

      if (startPage > 1) {
        pages.push(1)
        if (startPage > 2) pages.push("...")
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">Failed to load orders. Please try again.</p>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-2">Order History</h1>
      <p className="text-muted-foreground mb-4">View all your orders below.</p>

      {/* Orders Table Header Start */}
      <div className="w-full flex justify-between items-center mb-6">
        {/* Results Summary */}
        {ordersData && (
          <div className="text-sm text-gray-600">
            Showing {ordersData.data.orders.length} of {ordersData.data.pagination.total} orders
            {selectedStatus && ` (filtered by ${selectedStatus.replace("_", " ")})`}
          </div>
        )}

        {/* Status Filter */}
        <Select onValueChange={handleStatusChange} value={selectedStatus || "all"}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Order Status" />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center space-x-4">
                  <span className={`w-[12px] h-[12px] rounded-full ${option.color}`}></span>
                  <p>{option.label}</p>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Orders Table Header End */}

      {/* Actual Orders Table Start */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2Icon className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : ordersData?.data?.orders?.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 mt-8">
          <p className="mt-4 text-gray-500">
            {selectedStatus ? `No orders found with status: ${selectedStatus.replace("_", " ")}` : "No orders found."}
          </p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          {ordersData?.data?.orders?.map((order: Order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* Enhanced Pagination Controls */}
      {ordersData && ordersData.data.pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
          {/* Pagination Info */}
          <div className="text-sm text-gray-600">
            Page {currentPage} of {ordersData.data.pagination.totalPages} ({ordersData.data.pagination.total} total
            orders)
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <Button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 bg-transparent"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Previous
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {generatePageNumbers().map((page, index) => (
                <div key={index}>
                  {page === "..." ? (
                    <span className="px-3 py-1 text-gray-500">...</span>
                  ) : (
                    <Button
                      onClick={() => handlePageClick(page as number)}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="min-w-[40px]"
                    >
                      {page}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Next Button */}
            <Button
              onClick={handleNextPage}
              disabled={currentPage >= ordersData.data.pagination.totalPages}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              Next
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      {/* Actual Orders Table End*/}
    </>
  )
}

export default Orders
