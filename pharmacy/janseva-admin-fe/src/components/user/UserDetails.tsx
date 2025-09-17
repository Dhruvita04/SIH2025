"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/utils/API"
import {
  Loader2,
  CheckCircle2,
  XCircle,
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Clock,
  ArrowLeft,
  Package,
  Activity,
  Eye,
  Archive,
  Truck,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Alert, AlertDescription } from "../ui/alert"
import { format } from "date-fns"
import { toast } from "react-hot-toast"
import DataTableWithPagination from "@/components/Datatable/DataTableWithPagination"
import type { ColumnDef } from "@tanstack/react-table"

interface Order {
  id: string
  orderId: string
  date: string
  status: string
  orderTotal: number
}

interface OrderSummary {
  totalOrders: number
  totalSpent: number
  lastOrderDate: string
  statusBreakdown: {
    PAYMENT_FAILED: number
    PLACED: number
    SHIPPED: number
    IN_TRANSIT: number
    DELIVERED: number
    RETURNED: number
    REFUNDED: number
  }
}

interface OrdersResponse {
  status: string
  message: string
  data: {
    data: Order[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    orderSummary: OrderSummary
  }
}

interface UserDto {
  id: string
  email: string
  name: string | null
  googleId: string | null
  createdAt: string
  updatedAt: string
  phone: string | null
  isVerified: boolean
  role: "USER" | "ADMIN"
}

interface UserApiResponse {
  status: "success" | "error"
  message: string
  data: UserDto
}

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Orders state
  const [orders, setOrders] = useState<Order[]>([])
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState("")

  // Fetch user details
  const {
    data: userRes,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useQuery<UserApiResponse>({
    queryKey: ["user-details", id],
    queryFn: async () => {
      const response = await axiosInstance.get<UserApiResponse>(`users/${id}`)

      if (response.data.status !== "success") {
        throw new Error(response.data.message)
      }

      return response.data
    },
    enabled: !!id,
    retry: false,
  })

  // Fetch user orders
  const fetchOrders = async (): Promise<OrdersResponse> => {
    const params: {
      page: number
      limit: number
      search?: string
    } = {
      page: currentPage,
      limit: pageSize,
    }

    if (search) {
      params.search = search
    }

    const response = await axiosInstance.get(`users/${id}/orders`, { params })

    const data: OrdersResponse = response.data

    if (data.status === "success" && data.data) {
      setOrders(data.data.data || [])
      setOrderSummary(data.data.orderSummary || null)

      const total = data.data.pagination?.total || 0
      const pages = data.data.pagination?.totalPages || 1
      const page = data.data.pagination?.page || currentPage

      setTotalCount(total)
      setTotalPages(pages)
      setCurrentPage(page)
    } else {
      setOrders([])
      setOrderSummary(null)
      setTotalCount(0)
      setTotalPages(1)
      setCurrentPage(1)
    }

    return response.data
  }

  const {
    data: ordersResponse,
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    isPlaceholderData,
  } = useQuery<OrdersResponse>({
    queryKey: ["user-orders", id, currentPage, pageSize, search],
    queryFn: fetchOrders,
    enabled: !!id,
    placeholderData: (previousData) => previousData,
  })

  useEffect(() => {
    if (isUserError) {
      toast.error("Failed to load user details")
    }
    if (isOrdersError) {
      toast.error("Failed to load user orders")
    }
  }, [isUserError, isOrdersError])

  const handleGoBack = () => {
    navigate(-1)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page
  }

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch)
    setCurrentPage(1) // Reset to first page
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleViewOrderDetail = (orderId: string) => {
    navigate(`/admin/orders/view/${orderId}`)
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    }
    return email[0].toUpperCase()
  }

  const getRoleBadgeVariant = (role: string) => {
    return role === "ADMIN" ? "default" : "secondary"
  }

  const getVerificationBadge = (isVerified: boolean) => {
    if (isVerified) {
      return (
        <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-red-700 border-red-300 bg-red-50">
        <XCircle className="w-3 h-3 mr-1" />
        Unverified
      </Badge>
    )
  }

  const getOrderStatusBadge = (status: string) => {
    const statusConfig = {
      PLACED: { variant: "outline", className: "text-yellow-700 border-yellow-300 bg-yellow-50", icon: Clock },
      SHIPPED: { variant: "outline", className: "text-blue-700 border-blue-300 bg-blue-50", icon: Package },
      IN_TRANSIT: { variant: "outline", className: "text-purple-700 border-purple-300 bg-purple-50", icon: Truck },
      DELIVERED: { variant: "outline", className: "text-green-700 border-green-300 bg-green-50", icon: CheckCircle2 },
      RETURNED: { variant: "outline", className: "text-orange-700 border-orange-300 bg-orange-50", icon: Package },
      REFUNDED: { variant: "outline", className: "text-gray-700 border-gray-300 bg-gray-50", icon: XCircle },
      PAYMENT_FAILED: { variant: "outline", className: "text-red-700 border-red-300 bg-red-50", icon: XCircle },
      PAYMENT_PENDING: { variant: "outline", className: "text-gray-700 border-gray-300 bg-gray-50", icon: Clock },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PLACED
    const Icon = config.icon

    return (
      <Badge variant={config.variant as any} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace("_", " ")}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Order columns for DataTable
  const orderColumns: ColumnDef<Order>[] = [
    {
      accessorKey: "orderId",
      header: "Order ID",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.orderId}</div>
          <div className="text-xs text-gray-500">{row.original.id}</div>
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <div>
          <div className="text-sm">{format(new Date(row.original.date), "MMM dd, yyyy")}</div>
          <div className="text-xs text-gray-500">{format(new Date(row.original.date), "h:mm a")}</div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getOrderStatusBadge(row.original.status),
    },
    {
      accessorKey: "orderTotal",
      header: "Total",
      cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.original.orderTotal)}</div>,
    },
    {
      id: "viewDetail",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => handleViewOrderDetail(row.original.id)}>
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
      ),
      enableSorting: false,
      enableHiding: true,
    },
  ]

  if (!id) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">Invalid user ID. Please go back and try again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isUserLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <p className="text-sm text-gray-600">Loading user details...</p>
        </div>
      </div>
    )
  }

  if (isUserError || !userRes) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Failed to fetch user details. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const user = userRes.data

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="flex items-center space-x-2 hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">User Details</h1>
              <p className="text-sm text-gray-500">ID: {user.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Profile Summary - Left Column */}
            <div className="xl:col-span-4">
              <Card className="h-fit">
                <CardHeader className="pb-4">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-16 flex-shrink-0">
                      <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-700">
                        {getInitials(user.name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900 truncate">{user.name || "Unnamed User"}</h2>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                          {user.role}
                        </Badge>
                        {getVerificationBadge(user.isVerified)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Order Summary Stats */}
              <div className="grid grid-cols-1 gap-4 mt-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-900">{orderSummary?.totalOrders || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-green-600 font-bold text-lg">₹</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Total Spent</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(orderSummary?.totalSpent || 0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {orderSummary?.lastOrderDate && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Activity className="w-5 h-5 text-purple-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">Last Order</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {format(new Date(orderSummary.lastOrderDate), "MMM dd, yyyy")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(orderSummary.lastOrderDate), "h:mm a")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Order Status Breakdown */}
              {orderSummary?.statusBreakdown && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-base">Order Status Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {Object.entries(orderSummary.statusBreakdown).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">{getOrderStatusBadge(status)}</div>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base">Account Status</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Verification</span>
                      <span className={user.isVerified ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {user.isVerified ? "Verified" : "Pending"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Role</span>
                      <span className="font-medium capitalize">{user.role.toLowerCase()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Member Since</span>
                      <span className="font-medium">{format(new Date(user.createdAt), "MMM yyyy")}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Customer Type</span>
                      <span className="font-medium">
                        {(orderSummary?.totalOrders || 0) > 5
                          ? "Frequent"
                          : (orderSummary?.totalOrders || 0) > 0
                            ? "Regular"
                            : "New"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Details - Right Column */}
            <div className="xl:col-span-8">
              <div className="space-y-6">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Contact Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">Email Address</span>
                          </div>
                          <p className="text-sm text-gray-900 ml-6">{user.email}</p>
                        </div>

                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">Phone Number</span>
                          </div>
                          <p className="text-sm text-gray-900 ml-6">{user.phone || "Not provided"}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <Shield className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">Account Role</span>
                          </div>
                          <p className="text-sm text-gray-900 ml-6 capitalize">{user.role.toLowerCase()}</p>
                        </div>

                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">Full Name</span>
                          </div>
                          <p className="text-sm text-gray-900 ml-6">{user.name || "Not provided"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order History with DataTable */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4" />
                        <span>Order History</span>
                        <Badge variant="secondary" className="ml-2">
                          {orderSummary?.totalOrders || 0} orders
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isOrdersLoading && !ordersResponse ? (
                      <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : isOrdersError ? (
                      <div className="flex justify-center items-center h-64">
                        <p className="text-red-500">Error loading orders. Please try again.</p>
                      </div>
                    ) : orders.length > 0 ? (
                      <DataTableWithPagination<Order>
                        columns={orderColumns}
                        data={orders}
                        totalCount={totalCount}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                        onSearchChange={handleSearchChange}
                        searchValue={search}
                        pageSize={pageSize}
                        isLoading={isOrdersLoading || isPlaceholderData}
                        title="User Orders"
                        hideActions={true}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
                        <p className="text-gray-500">This user hasn't placed any orders yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Account Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Account Timeline</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">Account Created</span>
                        </div>
                        <div className="ml-6">
                          <p className="text-sm text-gray-900">{format(new Date(user.createdAt), "MMMM dd, yyyy")}</p>
                          <p className="text-xs text-gray-500">{format(new Date(user.createdAt), "h:mm a")}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">Last Updated</span>
                        </div>
                        <div className="ml-6">
                          <p className="text-sm text-gray-900">{format(new Date(user.updatedAt), "MMMM dd, yyyy")}</p>
                          <p className="text-xs text-gray-500">{format(new Date(user.updatedAt), "h:mm a")}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* System Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">System Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">User ID:</span>
                        <span className="ml-2 font-mono text-gray-900 break-all">{user.id}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Google ID:</span>
                        <span className="ml-2 font-mono text-gray-900 break-all">{user.googleId || "Not linked"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDetails
