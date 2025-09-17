"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Eye, CreditCard, User, Calendar, Hash } from "lucide-react"
import DataTableWithPagination from "../Datatable/DataTableWithPagination"
import axiosInstance from "../../utils/API"
import { PAYMENT_API } from "../../utils/API-ROUTES"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

interface Payment {
  id: string
  orderId: string
  userId: string
  method: string
  gateway: string
  status: "COMPLETED" | "PENDING" | "FAILED" | "CANCELLED"
  transactionId: string | null
  gatewayOrderId: string
  paymentSessionId: string
  gatewayReferenceId: string | null
  amount: number
  currency: string
  createdAt: string | any
  updatedAt: string | any
  callbackUrl: string | null
  paymentDate: string | any
  confirmationDate: string | any
  errorMessage: string | null
  isRefunded: boolean
  refundDate: string | null
  user: {
    id: string
    name: string
    email: string
  }
  order: {
    id: string
    orderId: string
    status: string
    user?: {
      email: string
    }
  }
}

interface PaymentResponse {
  status: string
  message: string
  data: {
    data: Payment[]
    pagination: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }
}

const statusColors = {
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
}

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PENDING", label: "Pending" },
  { value: "FAILED", label: "Failed" },
]

const PaymentView: React.FC = () => {
  const navigate = useNavigate()
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")

  // Debounced search function
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(null, args), delay)
    }
  }

  // Fetch payments from API
  const fetchPayments = useCallback(async (page = 1, status = "", search = "", pageSize = 10) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(status && status !== "all" && { status }),
        ...(search && { search }),
      })

      const response = await axiosInstance.get(`${PAYMENT_API}?${params}`)

      const data: PaymentResponse = response.data

      if (data.status === "success" && data.data && data.data.data) {
        setPayments(data.data.data)
        setCurrentPage(data.data.pagination.page)
        setTotalPages(data.data.pagination.totalPages)
        setTotalCount(data.data.pagination.total)
      } else {
        setPayments([])
        setTotalCount(0)
        setTotalPages(1)
        setCurrentPage(1)
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
      toast.error("Failed to fetch payments")
      setPayments([])
      setTotalCount(0)
      setTotalPages(1)
      setCurrentPage(1)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((search: string) => {
      setCurrentPage(1)
      fetchPayments(1, statusFilter, search, limit)
    }, 500),
    [statusFilter, limit, fetchPayments],
  )

  // Initial load
  useEffect(() => {
    fetchPayments(currentPage, statusFilter, searchTerm, limit)
  }, [currentPage, statusFilter, fetchPayments])

  // Handle search term changes
  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm)
    } else {
      // If search is cleared, fetch all payments
      setCurrentPage(1)
      fetchPayments(1, statusFilter, "", limit)
    }
  }, [searchTerm, debouncedSearch, statusFilter, limit, fetchPayments])

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (pageSize: number) => {
    setLimit(pageSize)
    setCurrentPage(1)
  }

  const handleSearchChange = (search: string) => {
    setSearchTerm(search)
  }

  const handleViewDetail = (paymentId: string) => {
    navigate(`/admin/payments/view/${paymentId}`)
  }

  const formatDate = (dateString: string | any) => {
    if (
      !dateString ||
      (typeof dateString === "object" && Object.keys(dateString).length === 0) ||
      dateString === null ||
      dateString === undefined
    ) {
      return "N/A"
    }

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "N/A"
      }

      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } catch (error) {
      console.error("Date formatting error:", error)
      return "N/A"
    }
  }

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const columns = [
    {
      accessorKey: "transactionId",
      header: "Transaction ID",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <Hash className="h-4 w-4 text-gray-500" />
          <span className="font-mono text-sm">{row.original.transactionId || "N/A"}</span>
        </div>
      ),
    },
    {
      accessorKey: "order.orderId",
      header: "Order #",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <CreditCard className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{row.original.order?.orderId || "N/A"}</span>
        </div>
      ),
    },
    {
      accessorKey: "user.name",
      header: "Customer",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-500" />
          <div>
            <div className="font-medium">{row.original.user?.name || "N/A"}</div>
            <div className="text-sm text-gray-500">
              {row.original.user?.email || row.original.order?.user?.email || "N/A"}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }: any) => <span className="font-medium">{formatAmount(row.original.amount)}</span>,
    },
    {
      accessorKey: "method",
      header: "Method",
      cell: ({ row }: any) => <div className="capitalize">{row.original.method?.replace("_", " ") || "N/A"}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge className={statusColors[row.original.status as keyof typeof statusColors] || statusColors.CANCELLED}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{formatDate(row.original.createdAt)}</span>
        </div>
      ),
    },
    {
      id: "viewDetail",
      header: "View Detail",
      cell: ({ row }: any) => (
        <Button variant="outline" size="sm" onClick={() => handleViewDetail(row.original.id)}>
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Payment Transactions Table */}
      <Card>
        <CardContent className="p-6">
          <DataTableWithPagination
            columns={columns}
            data={payments}
            isLoading={isLoading}
            title=""
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSearchChange={handleSearchChange}
            hideActions={true}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilter}
            statusOptions={statusOptions}
            searchValue={searchTerm}
            pageSize={limit}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentView
