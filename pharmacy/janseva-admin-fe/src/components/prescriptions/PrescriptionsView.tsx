"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import axiosInstance from "@/utils/API"
import { PRESCRIPTION_API } from "@/utils/API-ROUTES"
import { Card } from "@/components/ui/card"
import DataTableWithPagination from "@/components/Datatable/DataTableWithPagination"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Loader2, Eye } from "lucide-react"
import toast from "react-hot-toast"

interface Prescription {
  id: string
  userId: string
  patientName: string
  patientAge: number
  patientGender: string
  patientWeight: number | null
  patientHeight: number | null
  doctorName: string
  status: string
  prescriptionUrl: string
  patientBloodGroup: string | null
  createdAt: string
  updatedAt: string
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface PrescriptionResponse {
  status: string
  message: string
  data: {
    data: Prescription[]
    pagination: PaginationInfo
  }
}

const statusColors: { [key: string]: string } = {
  IN_REVIEW: "bg-blue-100 text-blue-800",
  APPROVED: "bg-orange-100 text-orange-800",
  UPLOADED: "bg-yellow-100 text-yellow-800",
  REJECTED: "bg-red-100 text-red-800",
  ORDERED: "bg-green-100 text-green-800",
}

const statusOptions = [
  { value: "ALL", label: "All Status" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "UPLOADED", label: "Uploaded" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ORDERED", label: "Ordered" },
]

export default function PrescriptionView() {
  const navigate = useNavigate()

  const [statusFilter, setStatusFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState("")

  // State variables to match Orders pattern
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const fetchPrescriptions = async (): Promise<PrescriptionResponse> => {
    const params: {
      status?: string
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
    if (search) {
      params.search = search
    }

    const response = await axiosInstance.get(PRESCRIPTION_API, { params })

    const data: PrescriptionResponse = response.data

    if (data.status === "success" && data.data) {
      setPrescriptions(data.data.data || [])

      // Handle different possible response structures
      const total = data.data.pagination?.total || 0
      const pages = data.data.pagination?.totalPages || Math.ceil(total / pageSize) || 1
      const page = data.data.pagination?.page || currentPage

      setTotalCount(total)
      setTotalPages(pages)
      setCurrentPage(page)
    } else {
      setPrescriptions([])
      setTotalCount(0)
      setTotalPages(1)
      setCurrentPage(1)
    }

    return response.data
  }

  const {
    data: prescriptionResponse,
    isLoading,
    error,
    isPlaceholderData,
    refetch,
  } = useQuery<PrescriptionResponse>({
    queryKey: ["prescriptions", statusFilter, currentPage, pageSize, search],
    queryFn: fetchPrescriptions,
    placeholderData: (previousData) => previousData,
  })

  const prescriptionDeleteMutation = useMutation({
    mutationFn: (prescriptionId: string) => {
      return axiosInstance.delete(`${PRESCRIPTION_API}/${prescriptionId}`)
    },
    onSuccess: (response) => {
      const {
        data: { status, message },
      } = response
      if (status === "success") {
        toast.success(message)
        refetch()
      } else {
        toast.error(message)
      }
    },
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleViewDetail = (prescriptionId: string) => {
    navigate(`/admin/prescriptions/single/${prescriptionId}`)
  }

  const onDelete = (prescriptionId: string) => {
    prescriptionDeleteMutation.mutate(prescriptionId)
  }

  const columns: ColumnDef<Prescription>[] = useMemo(
    () => [
      {
        accessorKey: "patientName",
        header: "Patient Name",
        cell: ({ row }) => row.original.patientName,
      },
      {
        accessorKey: "doctorName",
        header: "Doctor Name",
        cell: ({ row }) => row.original.doctorName,
      },
      {
        accessorKey: "status",
        header: "Prescription Status",
        cell: ({ row }) => (
          <Badge className={statusColors[row.original.status as keyof typeof statusColors]}>
            {row.original.status.replace("_", " ")}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) =>
          typeof row.original.createdAt === "string"
            ? format(new Date(row.original.createdAt), "dd MMM yyyy, hh:mm a")
            : "N/A",
      },
      {
        accessorKey: "updatedAt",
        header: "Updated At",
        cell: ({ row }) =>
          typeof row.original.updatedAt === "string"
            ? format(new Date(row.original.updatedAt), "dd MMM yyyy, hh:mm a")
            : "N/A",
      },
      {
        id: "viewOrder",
        header: "View Order",
        cell: ({ row }) => (
          <Button variant="outline" size="sm" onClick={() => handleViewDetail(row.original.id)}>
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
        ),
        enableSorting: false,
        enableHiding: true,
      },
    ],
    [navigate],
  )

  return (
    <div className="container mx-auto py-4">
      <Card className="p-6 space-y-6">
        {isLoading && !prescriptionResponse ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">Error loading prescriptions. Please try again.</p>
          </div>
        ) : (
          <DataTableWithPagination<Prescription>
            columns={columns}
            data={prescriptions}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSearchChange={handleSearchChange}
            searchValue={search}
            pageSize={pageSize}
            isLoading={isLoading || isPlaceholderData}
            title="Prescriptions"
            hideActions={true}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            statusOptions={statusOptions}
            onDelete={onDelete}
          />
        )}
      </Card>
    </div>
  )
}
