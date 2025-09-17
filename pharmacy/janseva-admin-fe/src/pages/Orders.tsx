"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/utils/API"
import { ORDERS_API } from "@/utils/API-ROUTES"
import { Card } from "@/components/ui/card"
import DataTableWithPagination from "@/components/Datatable/DataTableWithPagination"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Loader2, Download, Eye } from "lucide-react"

interface Order {
  id: string
  orderId: string
  orderNumber: number
  prescriptionId: string
  paymentId: string | null
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
  products: {
    id: string
    orderId: string
    productId: string
    variantId: string
    quantity: number
    originalPrice: number
    productDiscount: number
    price: number
    createdAt: string
    updatedAt: string
    product: {
      id: string
      name: string
      description: string
      images: string[]
      categoryId: string
      brandId: string
      uses: string | null
      direction: string
      sideEffects: string
      additionalInfo: string
      createdAt: string
      updatedAt: string
      createdBy: string
      updatedBy: string
      dietAndLifestyleGuidance: string
      dosageInformation: string
      highlights: string
      howToUse: string
      ingredients: string
      interactions: string
      keyUses: string
      medActivity: string
      precaution: string
      routeOfAdministration: string
      safetyInformation: string
      storage: string
      composition: string
      slug: string
      tags: string[]
    }
    variant: {
      id: string
      productId: string
      name: string
      price: number
      stock: number
      createdAt: string
      updatedAt: string
      createdBy: string
      updatedBy: string
      units: number
      discount: number
      discountType: string
    }
  }[]
  payment: {
    id: string
    orderId: string
    userId: string
    method: string
    gateway: string
    status: string
    transactionId: string
    gatewayOrderId: string
    paymentSessionId: string
    gatewayReferenceId: string
    amount: number
    currency: string
    createdAt: string
    updatedAt: string
    callbackUrl: string | null
    paymentDate: string
    confirmationDate: string
    errorMessage: string
    isRefunded: boolean
    refundDate: string | null
  }
  pdf: string | null
}

interface OrdersResponse {
  status: string
  message: string
  data: {
    orders: Order[]
    totalCount: number
    pagination: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }
}

const statusColors: { [key: string]: string } = {
  PLACED: "bg-yellow-100 text-yellow-800",
  SHIPPED: "bg-blue-100 text-blue-800",
  IN_TRANSIT: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  RETURNED: "bg-orange-100 text-orange-800",
  REFUNDED: "bg-gray-100 text-gray-800",
  PAYMENT_PENDING: "bg-gray-100 text-gray-800",
  PAYMENT_FAILED: "bg-red-100 text-red-800",
}

const statusOptions = [
  { value: "ALL", label: "All Status" },
  { value: "PLACED", label: "Placed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "RETURNED", label: "Returned" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "PAYMENT_PENDING", label: "Payment Pending" },
  { value: "PAYMENT_FAILED", label: "Payment Failed" },
]

export default function Orders() {
  const navigate = useNavigate()

  const [statusFilter, setStatusFilter] = useState("ALL")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState("")

  // State variables to match PaymentView pattern
  const [orders, setOrders] = useState<Order[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const fetchOrders = async (): Promise<OrdersResponse> => {
    const params: {
      status?: string
      fromDate?: string
      toDate?: string
      page: number
      limit: number
      search?: string
    } = {
      page: currentPage,
      limit: pageSize,
    }
    if (statusFilter !== "ALL") {
      params.status = statusFilter
    }
    if (startDate) {
      params.fromDate = startDate
    }
    if (endDate) {
      params.toDate = endDate
    }
    if (search) {
      params.search = search
    }

    const response = await axiosInstance.get(ORDERS_API, { params })

    const data: OrdersResponse = response.data

    if (data.status === "success" && data.data) {
      setOrders(data.data.orders || [])

      // Handle different possible response structures
      const total = data.data.totalCount || data.data.pagination?.total || 0
      const pages = data.data.pagination?.totalPages || Math.ceil(total / pageSize) || 1
      const page = data.data.pagination?.page || currentPage

      setTotalCount(total)
      setTotalPages(pages)
      setCurrentPage(page)
    } else {
      setOrders([])
      setTotalCount(0)
      setTotalPages(1)
      setCurrentPage(1)
    }

    return response.data
  }

  const {
    data: ordersResponse,
    isLoading,
    error,
    isPlaceholderData,
  } = useQuery<OrdersResponse>({
    queryKey: ["orders", statusFilter, startDate, endDate, currentPage, pageSize, search],
    queryFn: fetchOrders,
    placeholderData: (previousData) => previousData,
  })

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page
  }

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch)
    setCurrentPage(1) // Reset to first page
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1) // Reset to first page
  }

  const handleStartDateChange = (date: string) => {
    setStartDate(date)
    setCurrentPage(1) // Reset to first page
  }

  const handleEndDateChange = (date: string) => {
    setEndDate(date)
    setCurrentPage(1) // Reset to first page
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const clearDateFilters = () => {
    setStartDate("")
    setEndDate("")
    setCurrentPage(1)
  }

  const handleViewDetail = (orderId: string) => {
    navigate(`/admin/orders/view/${orderId}`)
  }

  const columns: ColumnDef<Order>[] = useMemo(
    () => [
      {
        accessorKey: "orderNumber",
        header: "Order #",
        cell: ({ row }) => `#${row.original.orderNumber}`,
      },
      {
        accessorKey: "orderId",
        header: "Order ID",
        cell: ({ row }) => row.original.orderId,
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) =>
          typeof row.original.createdAt === "string" ? format(new Date(row.original.createdAt), "dd MMM yyyy") : "N/A",
      },
      {
        accessorKey: "user.name",
        header: "Customer",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.user.name}</div>
            <div className="text-sm text-gray-500">{row.original.user.email}</div>
          </div>
        ),
      },
      {
        accessorKey: "shippingAddress",
        header: "Address",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.shippingAddress.city}</div>
            <div className="text-sm text-gray-500">{row.original.shippingAddress.state}</div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge className={statusColors[row.original.status as keyof typeof statusColors]}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "orderTotal",
        header: "Total",
        cell: ({ row }) => `₹${row.original.orderTotal.toFixed(2)}`,
      },
      {
        id: "viewDetail",
        header: "View Detail",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleViewDetail(row.original.id)}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            {row.original.pdf && (
              <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(row.original)}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        ),
        enableSorting: false,
        enableHiding: true,
      },
    ],
    [navigate],
  )

  const handleDownloadPDF = (order: Order) => {
    if (order.pdf) {
      try {
        // Decode base64 string
        const byteCharacters = atob(order.pdf)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: "application/pdf" })

        // Create download link
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `order-${order.orderNumber}-invoice.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error("PDF download failed:", error)
      }
    }
  }

  return (
    <div className="container mx-auto py-4">
      <Card className="p-6 space-y-6">
        {isLoading && !ordersResponse ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">Error loading orders. Please try again.</p>
          </div>
        ) : (
          <DataTableWithPagination<Order>
            columns={columns}
            data={orders}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSearchChange={handleSearchChange}
            searchValue={search}
            pageSize={pageSize}
            isLoading={isLoading || isPlaceholderData}
            title="Orders"
            hideActions={true}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            statusOptions={statusOptions}
            showDateFilter={true}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            onClearDateFilters={clearDateFilters}
          />
        )}
      </Card>
    </div>
  )
}
