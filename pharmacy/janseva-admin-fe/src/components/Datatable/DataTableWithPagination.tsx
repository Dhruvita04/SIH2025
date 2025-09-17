"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  ChevronDown,
  MoreHorizontal,
  Trash,
  Loader2,
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Input } from "@/components/ui/input"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { useNavigate } from "react-router-dom"

interface DataTableWithPaginationProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  title: string
  totalCount: number
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  onSearchChange?: (search: string) => void
  onDelete?: (id: string) => void
  onDeleteSelected?: (ids: string[]) => void
  onEdit?: (id: string) => void
  isLoading?: boolean
  error?: string
  editPath?: string
  isSlug?: boolean
  isDeleting?: boolean
  hideActions?: boolean
  statusFilter?: string
  onStatusFilterChange?: (value: string) => void
  statusOptions?: Array<{ value: string; label: string }>
  searchValue?: string
  pageSize?: number
  showDateFilter?: boolean
  startDate?: string
  endDate?: string
  onStartDateChange?: (date: string) => void
  onEndDateChange?: (date: string) => void
  onClearDateFilters?: () => void
}

export default function DataTableWithPagination<TData extends { id: string }>({
  columns: columnsProp,
  data,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onDelete,
  isLoading,
  error,
  editPath,
  isSlug,
  isDeleting,
  hideActions,
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  searchValue = "",
  pageSize = 10,
  showDateFilter = false,
  startDate = "",
  endDate = "",
  onStartDateChange,
  onEndDateChange,
  onClearDateFilters,
}: DataTableWithPaginationProps<TData>) {
  const navigate = useNavigate()

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const [{ pageIndex }, setPagination] = React.useState({
    pageIndex: currentPage - 1,
    pageSize: pageSize,
  })

  // Update pageIndex when currentPage prop changes
  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: currentPage - 1 }))
  }, [currentPage])

  const columns = React.useMemo(
    () => [
      ...columnsProp,
      ...(hideActions
        ? []
        : [
            {
              id: "actions",
              header: "Actions",
              cell: ({ row }: { row: any }) => {
                const item = row.original as TData & { slug?: string }
                const slug = item.slug || item.id
                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                        disabled={isDeleting}
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px] dark:bg-gray-800">
                      <DropdownMenuLabel className="dark:text-white">Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          if (isSlug) {
                            navigate(`${editPath}/${slug}`)
                          } else {
                            if (editPath) {
                              navigate(`${editPath}/${item.id}`)
                            }
                          }
                        }}
                        className="dark:text-white dark:hover:bg-gray-700 cursor-pointer"
                        disabled={isDeleting}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="dark:text-red-400 dark:hover:bg-gray-700 dark:hover:text-red-300 cursor-pointer text-red-600"
                            onSelect={(e) => e.preventDefault()}
                            disabled={isDeleting}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="dark:bg-gray-800">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="dark:text-white">Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription className="dark:text-gray-400">
                              This action cannot be undone. This will permanently delete the selected item and remove
                              its data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="dark:bg-gray-700 dark:text-white" disabled={isDeleting}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item)} disabled={isDeleting}>
                              {isDeleting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                "Continue"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              },
            },
          ]),
    ],
    [columnsProp, editPath, isDeleting, hideActions],
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination: { pageIndex, pageSize },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    pageCount: totalPages,
  })

  const handleDelete = (item: TData) => {
    if (onDelete) {
      onDelete(item.id)
    }
  }

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value)
    }
  }

  const handlePageSizeChange = (newPageSize: string) => {
    const size = Number(newPageSize)
    setPagination({ pageIndex: 0, pageSize: size })
    if (onPageSizeChange) {
      onPageSizeChange(size)
    }
    onPageChange(1) // Reset to first page when changing page size
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const delta = 2 // Number of pages to show on each side of current page
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages)
    } else {
      if (totalPages > 1) {
        rangeWithDots.push(totalPages)
      }
    }

    return rangeWithDots
  }

  return (
    <div className="w-full overflow-auto">
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center space-x-3">
          <Input
            placeholder="Search all columns..."
            value={searchValue ?? ""}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="max-w-sm dark:bg-zinc-800 dark:border-slate-700 dark:text-white"
            disabled={isDeleting}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="dark:border-gray-700 dark:text-white bg-transparent"
                disabled={isDeleting}
              >
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:bg-gray-800">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize dark:text-white"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      disabled={isDeleting}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center space-x-3">
          {/* Date Range Filter */}
          {showDateFilter && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Date Range:</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange?.(e.target.value)}
                max={endDate || undefined}
                className="w-[150px]"
                placeholder="Start Date"
                disabled={isDeleting}
              />
              <span className="text-sm text-gray-500">to</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange?.(e.target.value)}
                min={startDate || undefined}
                className="w-[150px]"
                placeholder="End Date"
                disabled={isDeleting}
              />
              {(startDate || endDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearDateFilters}
                  className="h-8 px-2"
                  disabled={isDeleting}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          {/* Status Filter */}
          {statusOptions && onStatusFilterChange && (
            <Select value={statusFilter} onValueChange={onStatusFilterChange} disabled={isDeleting}>
              <SelectTrigger className="w-48 dark:border-gray-700 dark:text-white bg-transparent">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800">
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="dark:text-white">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      <div className="rounded-md border dark:border-gray-700">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="dark:border-gray-700">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="dark:text-gray-400">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center dark:text-gray-400">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-red-500 dark:text-red-400">
                  {error}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="dark:border-gray-700">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="dark:text-gray-300">
                      {cell.getValue() === "" ? "-" : flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center dark:text-gray-400">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground dark:text-gray-400">
          Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{" "}
          entries
        </div>
        <div className="flex items-center space-x-2">
          {/* Enhanced Pagination Controls */}
          <div className="flex items-center space-x-1">
            {/* First Page Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage <= 1 || isDeleting}
              className="dark:border-gray-700 dark:text-white bg-transparent"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isDeleting}
              className="dark:border-gray-700 dark:text-white bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {/* Page Numbers */}
            {totalPages > 0 &&
              getPageNumbers().map((pageNumber, index) => (
                <React.Fragment key={index}>
                  {pageNumber === "..." ? (
                    <span className="px-2 py-1 text-sm text-gray-500 dark:text-gray-400">...</span>
                  ) : (
                    <Button
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(pageNumber as number)}
                      disabled={isDeleting}
                      className={`min-w-[32px] ${
                        currentPage === pageNumber
                          ? "bg-primary text-primary-foreground"
                          : "dark:border-gray-700 dark:text-white bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {pageNumber}
                    </Button>
                  )}
                </React.Fragment>
              ))}

            {/* Next Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isDeleting}
              className="dark:border-gray-700 dark:text-white bg-transparent"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last Page Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage >= totalPages || isDeleting}
              className="dark:border-gray-700 dark:text-white bg-transparent"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2 py-4">
        <Select value={`${pageSize}`} onValueChange={handlePageSizeChange} disabled={isDeleting}>
          <SelectTrigger className="w-[180px] dark:border-gray-700 dark:text-white">
            <SelectValue placeholder="Select rows per page" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800">
            <SelectItem value="10" className="dark:text-white">
              10 rows per page
            </SelectItem>
            <SelectItem value="20" className="dark:text-white">
              20 rows per page
            </SelectItem>
            <SelectItem value="50" className="dark:text-white">
              50 rows per page
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
