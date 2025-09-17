"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import DataTableWithPagination from "../Datatable/DataTableWithPagination"
import axiosInstance from "../../utils/API"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { UserIcon, Calendar, Hash, Eye, Phone, Mail, CheckCircle, XCircle, ShoppingBag } from "lucide-react"

interface User {
  id: string
  name: string | null
  email: string
  googleId?: string | null
  phone?: string | null
  isVerified: boolean
  role: "USER" | "ADMIN"
  createdAt: string
  updatedAt: string
  orderSummary: {
    totalOrders: number
    totalSpent: number
  }
}

interface ApiResponse {
  status: "success" | "error"
  message: string
  data: {
    data: User[]
    pagination: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }
}

interface UsersViewProps {
  hideActions?: boolean
}

const UsersView: React.FC<UsersViewProps> = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch users
  const fetchUsers = useCallback(async (page = 1, search = "", pageSize = 10) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(search && { search }),
      })
      const res = await axiosInstance.get<ApiResponse>(`users?${params}`)
      if (res.data.status === "success") {
        const { data: items, pagination } = res.data.data
        setUsers(items)
        setCurrentPage(pagination.page)
        setTotalPages(pagination.totalPages)
        setTotalCount(pagination.total)
      } else {
        setUsers([])
        setTotalCount(0)
        setTotalPages(1)
        setCurrentPage(1)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to fetch users")
      setUsers([])
      setTotalCount(0)
      setTotalPages(1)
      setCurrentPage(1)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounce helper
  const debounce = (fn: Function, ms = 300) => {
    let t: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(t)
      t = setTimeout(() => fn(...args), ms)
    }
  }
  const debouncedSearch = useCallback(
    debounce((s: string) => {
      setCurrentPage(1)
      fetchUsers(1, s, limit)
    }, 500),
    [fetchUsers, limit],
  )

  useEffect(() => {
    fetchUsers(currentPage, searchTerm, limit)
  }, [currentPage, fetchUsers, limit])

  useEffect(() => {
    if (searchTerm) debouncedSearch(searchTerm)
    else {
      setCurrentPage(1)
      fetchUsers(1, "", limit)
    }
  }, [searchTerm, debouncedSearch, limit])

  const handlePageChange = (p: number) => setCurrentPage(p)
  const handlePageSizeChange = (s: number) => {
    setLimit(s)
    setCurrentPage(1)
  }
  const handleSearchChange = (s: string) => setSearchTerm(s)

  const formatDateTime = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } catch {
      return "N/A"
    }
  }

  const columns = [
    {
      accessorKey: "id",
      header: "User ID",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <Hash className="h-4 w-4 text-gray-500" />
          <span className="font-mono text-sm">{row.original.id}</span>
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <UserIcon className="h-4 w-4 text-gray-500" />
          <span>{row.original.name ?? "—"}</span>
        </div>
      ),
    },
    {
      accessorKey: "contact",
      header: "Contact Info",
      cell: ({ row }: any) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{row.original.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{row.original.phone ?? "—"}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "orderSummary",
      header: "Order Summary",
      cell: ({ row }: any) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">{row.original.orderSummary.totalOrders} Orders</span>
          </div>
          <div className="text-sm text-gray-600">
            ₹{row.original.orderSummary.totalSpent.toLocaleString("en-IN")} Spent
          </div>
        </div>
      ),
    },
    {
      accessorKey: "isVerified",
      header: "Verified",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          {row.original.isVerified ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <Badge variant="outline" className="text-green-600 border-green-200">
                Verified
              </Badge>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-500" />
              <Badge variant="outline" className="text-red-600 border-red-200">
                Unverified
              </Badge>
            </>
          )}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined On",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{formatDateTime(row.original.createdAt)}</span>
        </div>
      ),
    },
    {
      accessorKey: "viewDetails",
      header: "Actions",
      cell: ({ row }: any) => (
        <Button variant="outline" size="sm" onClick={() => navigate(`${row.original.id}`)}>
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <DataTableWithPagination
            title="Users"
            columns={columns}
            data={users}
            isLoading={isLoading}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSearchChange={handleSearchChange}
            searchValue={searchTerm}
            hideActions={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default UsersView
