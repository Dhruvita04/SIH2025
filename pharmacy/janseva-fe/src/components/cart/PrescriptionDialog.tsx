"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Upload, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { PreviewDialog } from "./PreviewDialog"
import { useQuery, useMutation } from "@tanstack/react-query"
import axiosInstance from "@/utils/API"
import useAuthFacade from "@/facades/useAuthFacade"
import { PRESCRIPTION_HISTORY, CART_CHANGE_PRESCRIPTION } from "@/CONFIG/api-routes"
import { PresciptionUpload } from "../prescriptionorder"
import type { Prescription, PrescriptionResponse } from "./types"
import useCartFacade from "@/facades/useCartFacade"
import { toast } from "react-hot-toast"

interface PrescriptionDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (prescription: Prescription) => void
}

export function PrescriptionDialog({ isOpen, onClose, onSelect }: PrescriptionDialogProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(10)
  const { user, isAuthenticated } = useAuthFacade()
  const { prescription: selectedPrescription } = useCartFacade()

  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({})
  const [refreshingImages, setRefreshingImages] = useState<{ [key: string]: boolean }>({})

  // Mutation for changing prescription
  const changePrescriptionMutation = useMutation({
    mutationFn: async (newPrescriptionId: string) => {
      if (!isAuthenticated || !user?.id) {
        throw new Error("User not authenticated")
      }

      const response = await axiosInstance.patch(CART_CHANGE_PRESCRIPTION, {
        userId: user.id,
        prescriptionId: newPrescriptionId,
      })
      return response.data
    },
    onSuccess: () => {
      toast.success("Prescription changed successfully")

    },
    onError: (error: any) => {
      console.error("Failed to change prescription:", error)
      toast.error("Failed to change prescription")
    },
  })

  const fetchPrescriptions = async (page: number): Promise<{ prescriptions: Prescription[]; pagination: any }> => {
    try {
      const response = await axiosInstance.get<PrescriptionResponse>(
        `${PRESCRIPTION_HISTORY}/${user?.id}?page=${page}&limit=${limit}`,
      )

      return {
        prescriptions: response.data.data.data || [],
        pagination: response.data.data.pagination,
      }
    } catch (error) {
      console.error("Failed to fetch prescriptions:", error)
      throw error
    }
  }

  const handleUploadDialog = (e: boolean) => {
    setShowUploadDialog(e)
    if (!e) {
      refetch()
    }
  }

  const handleUploadSuccess = () => {
    setShowUploadDialog(false)
    refetch()
  }

  const handleImageError = (prescriptionId: string) => {
    setImageErrors((prev) => ({ ...prev, [prescriptionId]: true }))
  }

  const refreshPrescription = async (prescriptionId: string) => {
    setRefreshingImages((prev) => ({ ...prev, [prescriptionId]: true }))
    try {
      await refetch()
      setImageErrors((prev) => ({ ...prev, [prescriptionId]: false }))
    } catch (error) {
      console.error("Failed to refresh prescription list:", error)
    } finally {
      setRefreshingImages((prev) => ({ ...prev, [prescriptionId]: false }))
    }
  }

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["prescriptions", user?.id, currentPage],
    queryFn: () => fetchPrescriptions(currentPage),
    enabled: !!user?.id && isOpen,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })

  const prescriptions = data?.prescriptions || []
  const pagination = data?.pagination

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleSelectPrescription = (prescription: Prescription) => {
    // Call the parent onSelect first (updates local state)
    onSelect(prescription)

    // Then call API to update server if user is authenticated
    if (isAuthenticated && user?.id) {
      changePrescriptionMutation.mutate(prescription.id)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">Select Prescription</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="grid gap-4 p-1">
              {isLoading ? (
                <div className="py-10 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-lg text-muted-foreground mt-2">Loading prescriptions...</p>
                </div>
              ) : prescriptions?.length > 0 ? (
                <div className="grid gap-3">
                  {prescriptions.map((prescription: Prescription) => (
                    <div
                      key={prescription.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent transition-colors min-h-[80px]"
                    >
                      <div className="relative h-16 w-16 rounded-md overflow-hidden border bg-muted flex-shrink-0">
                        {imageErrors[prescription.id] ? (
                          <div className="flex flex-col items-center justify-center h-full text-xs text-muted-foreground">
                            <p className="text-center mb-1 text-sm">Image unavailable</p>
                            <button
                              onClick={() => refreshPrescription(prescription.id)}
                              disabled={refreshingImages[prescription.id]}
                              className="text-blue-500 hover:text-blue-700 text-sm disabled:opacity-50"
                            >
                              {refreshingImages[prescription.id] ? "Refreshing..." : "Refresh"}
                            </button>
                          </div>
                        ) : (
                          <img
                            src={
                              prescription.prescription?.url || "/placeholder.svg?height=64&width=64&query=prescription"
                            }
                            alt={prescription.patientName}
                            className="object-cover w-full h-full"
                            onError={() => handleImageError(prescription.id)}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="mb-1">
                          <h4 className="text-xl font-medium text-gray-900">{prescription.patientName}</h4>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg text-gray-600">
                            Age {prescription.patientAge} • {prescription.patientGender}
                          </span>
                        </div>
                        <div className="text-lg text-gray-600">Dr. {prescription.doctorName || "Not specified"}</div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 px-4 text-base bg-transparent"
                          onClick={() => setPreviewImage(prescription.prescription?.url || null)}
                          disabled={!prescription.prescription?.url}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        {selectedPrescription?.id !== prescription.id ? (
                          <Button
                            size="sm"
                            variant="default"
                            className="h-9 px-4 text-base"
                            onClick={() => handleSelectPrescription(prescription)}
                            disabled={changePrescriptionMutation.isPending}
                          >
                            {changePrescriptionMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                Selecting...
                              </>
                            ) : (
                              "Select"
                            )}
                          </Button>
                        ) : (
                          <div className="text-base px-4 py-2 text-green-700 bg-green-100 font-medium rounded-md flex items-center justify-center">
                            Selected
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-lg text-muted-foreground mb-4">No prescriptions uploaded yet.</p>
                  <p className="text-base text-muted-foreground">Upload your first prescription to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-base text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="text-base h-9"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.totalPages}
                  className="text-base h-9"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button
              className="w-full h-10 text-base"
              onClick={() => setShowUploadDialog(true)}
              disabled={changePrescriptionMutation.isPending}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload New Prescription
            </Button>
          </div>

          {/* Show loading state when changing prescription */}
          {changePrescriptionMutation.isPending && (
            <div className="mt-2 text-sm text-blue-600 flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Updating prescription on server...
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showUploadDialog} onOpenChange={(e) => handleUploadDialog(e)}>
        <DialogContent className="sm:max-w-[600px] max-h-[70vh] overflow-y-auto">
          <PresciptionUpload onSuccess={handleUploadSuccess} />
        </DialogContent>
      </Dialog>

      {previewImage && (
        <PreviewDialog isOpen={!!previewImage} onClose={() => setPreviewImage(null)} imageUrl={previewImage} />
      )}
    </>
  )
}
