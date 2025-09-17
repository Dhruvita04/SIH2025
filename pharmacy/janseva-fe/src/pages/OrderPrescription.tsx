"use client"

import { prescriptionImagePath } from "@/assets/images"
import { LOGIN, ORDER_PRESCRIPTION } from "@/CONFIG/routes"
import { ChevronRightIcon, ShoppingCartIcon } from "@heroicons/react/20/solid"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { PresciptionUpload } from "@/components/prescriptionorder"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import useAuthFacade from "@/facades/useAuthFacade"
import { useQuery, useMutation } from "@tanstack/react-query"
import axiosInstance from "@/utils/API"
import { PRESCRIPTION_HISTORY, PRESCRIPTION_CREATE_ORDER } from "@/CONFIG/api-routes"
import type { Prescription } from "@/components/cart/types"
import { ChevronLeft, ChevronRight, Upload, Eye, Plus, User, Stethoscope, FileText, CheckCircle } from "lucide-react"
import { toast } from "react-hot-toast"

function OrderPrescription() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthFacade()
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(10)
  const [isCreateOrderDialogOpen, setIsCreateOrderDialogOpen] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showExistingPrescriptions, setShowExistingPrescriptions] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [dialogCurrentPage, setDialogCurrentPage] = useState(1)
  const [dialogLimit] = useState(5) // Smaller limit for dialog

  // Fetch prescription orders (with order=true)
  const {
    data: prescriptionOrders,
    isLoading: isPrescriptionsLoading,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: [PRESCRIPTION_HISTORY, user?.id, currentPage, "orders"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${PRESCRIPTION_HISTORY}/${user?.id}?page=${currentPage}&limit=${limit}&order=true`,
      )
      return response.data
    },
    enabled: !!user?.id,
  })

  // Fetch all prescriptions for selection (without order=true)
  const {
    data: allPrescriptions,
    isLoading: isAllPrescriptionsLoading,
    refetch: refetchAllPrescriptions,
  } = useQuery({
    queryKey: [PRESCRIPTION_HISTORY, user?.id, dialogCurrentPage, "all"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${PRESCRIPTION_HISTORY}/${user?.id}?page=${dialogCurrentPage}&limit=${dialogLimit}`,
      )
      return response.data
    },
    enabled: !!user?.id && showExistingPrescriptions,
  })

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (prescriptionId: string) => {
      return await axiosInstance.post(PRESCRIPTION_CREATE_ORDER, {
        userId: user?.id,
        prescriptionId: prescriptionId,
      })
    },
    onSuccess: () => {
      toast.success("Prescription order created successfully!")
      refetchOrders()
      setIsCreateOrderDialogOpen(false)
      setShowUploadDialog(false)
      setShowExistingPrescriptions(false)
      setSelectedPrescription(null)
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Failed to create prescription order"
      if (errorMessage.includes("IN_REVIEW status already exists")) {
        toast.error("This prescription already has an order being reviewed. Please wait for it to be processed.")
      } else {
        toast.error(errorMessage)
      }
    },
  })

  const getPrescriptionStatus = (status: string) => {
    let bgColor = ""
    let displayText = status

    switch (status) {
      case "UPLOADED":
        bgColor = "bg-[#14317b]/10 text-[#14317b] border border-[#14317b]/20"
        displayText = "IN REVIEW"
        break
      case "APPROVED":
        bgColor = "bg-amber-100 text-amber-800 border border-amber-200"
        break
      case "ORDERED":
        bgColor = "bg-green-100 text-green-800 border border-green-200"
        break
      case "REJECTED":
        bgColor = "bg-red-100 text-red-800 border border-red-200"
        break
      case "COMPLETED":
        bgColor = "bg-purple-100 text-purple-800 border border-purple-200"
        break
      default:
        bgColor = "bg-gray-100 text-gray-800 border border-gray-200"
    }
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${bgColor}`}>{displayText}</span>
  }

  const handleCreateOrder = (prescriptionId: string) => {
    createOrderMutation.mutate(prescriptionId)
  }

  const handleUploadSuccess = () => {
    setShowUploadDialog(false)
    refetchAllPrescriptions()
    // After upload, show existing prescriptions so user can select the newly uploaded one
    setShowExistingPrescriptions(true)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleSelectExistingPrescription = () => {
    setShowUploadDialog(false)
    setShowExistingPrescriptions(true)
    setDialogCurrentPage(1) // Reset to first page
    refetchAllPrescriptions()
  }

  const handleUploadNewPrescription = () => {
    setShowExistingPrescriptions(false)
    setShowUploadDialog(true)
  }

  const resetDialogState = () => {
    setShowUploadDialog(false)
    setShowExistingPrescriptions(false)
    setSelectedPrescription(null)
    setPreviewImage(null)
    setDialogCurrentPage(1) // Reset dialog pagination
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(LOGIN)
    }
  }, [isAuthenticated, navigate])

  const prescriptions = prescriptionOrders?.data?.data || []
  const pagination = prescriptionOrders?.data?.pagination
  const availablePrescriptions = allPrescriptions?.data?.data || []
  const dialogPagination = allPrescriptions?.data?.pagination

  const handleDialogPageChange = (newPage: number) => {
    setDialogCurrentPage(newPage)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-6 w-6 text-[#14317b]" />
                Prescription Orders
              </h1>
              <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
                Upload your prescriptions and get them reviewed by our qualified doctors. Once approved, your order will
                be processed automatically.
              </p>
            </div>

            <Dialog
              open={isCreateOrderDialogOpen}
              onOpenChange={(open) => {
                setIsCreateOrderDialogOpen(open)
                if (!open) {
                  resetDialogState()
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-[#14317b] hover:bg-[#14317b]/90 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors">
                  <Plus className="h-4 w-4" />
                  Create New Order
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-hidden p-0">
                <div className="p-8 overflow-y-auto max-h-[85vh]">
                  {!showUploadDialog && !showExistingPrescriptions && (
                    <div className="space-y-8">
                      <div className="text-center">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">Create Prescription Order</h2>
                        <p className="text-gray-600 text-base">Choose how you'd like to proceed</p>
                      </div>

                      <div className="space-y-4">
                        <Button
                          variant="outline"
                          className="w-full h-auto p-5 flex items-center gap-4 hover:bg-[#14317b]/5 hover:border-[#14317b]/30 justify-start bg-transparent text-base"
                          onClick={handleSelectExistingPrescription}
                        >
                          <Eye className="h-6 w-6 text-[#14317b]" />
                          <div className="text-left">
                            <h3 className="font-semibold text-gray-900 text-base">Select Existing Prescription</h3>
                            <p className="text-sm text-gray-500">Choose from your uploaded prescriptions</p>
                          </div>
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full h-auto p-5 flex items-center gap-4 hover:bg-green-50 hover:border-green-300 justify-start bg-transparent text-base"
                          onClick={handleUploadNewPrescription}
                        >
                          <Upload className="h-6 w-6 text-green-600" />
                          <div className="text-left">
                            <h3 className="font-semibold text-gray-900 text-base">Upload New Prescription</h3>
                            <p className="text-sm text-gray-500">Upload a new prescription and create order</p>
                          </div>
                        </Button>
                      </div>
                    </div>
                  )}

                  {showUploadDialog && (
                    <div>
                      <div className="flex items-center gap-3 mb-8">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowUploadDialog(false)
                            setShowExistingPrescriptions(false)
                          }}
                          className="text-base"
                        >
                          ← Back
                        </Button>
                        <h3 className="font-semibold text-xl">Upload New Prescription</h3>
                      </div>
                      <PresciptionUpload onSuccess={handleUploadSuccess} />
                    </div>
                  )}

                  {showExistingPrescriptions && (
                    <div>
                      <div className="flex items-center gap-3 mb-8">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowUploadDialog(false)
                            setShowExistingPrescriptions(false)
                          }}
                          className="text-base"
                        >
                          ← Back
                        </Button>
                        <div>
                          <h3 className="font-semibold text-xl">Choose Prescription to Order</h3>
                          <p className="text-base text-gray-600 mt-1">
                            Select a prescription below and click "Create Order"
                          </p>
                        </div>
                      </div>

                      {isAllPrescriptionsLoading ? (
                        <div className="py-12 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#14317b] mx-auto"></div>
                          <p className="text-base text-gray-500 mt-3">Loading prescriptions...</p>
                        </div>
                      ) : availablePrescriptions.length > 0 ? (
                        <>
                          <div className="space-y-2 max-h-80 overflow-y-auto mb-6">
                            {availablePrescriptions.map((prescription: Prescription) => (
                              <div
                                key={prescription.id}
                                className={`cursor-pointer border-2 rounded-xl p-2 transition-all ${
                                  selectedPrescription?.id === prescription.id
                                    ? "border-[#14317b] bg-[#14317b]/5 shadow-md"
                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                                onClick={() => setSelectedPrescription(prescription)}
                              >
                                <div className="flex items-center gap-3">
                                  {/* Radio Button */}
                                  <div className="flex-shrink-0">
                                    <div
                                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        selectedPrescription?.id === prescription.id
                                          ? "border-[#14317b] bg-[#14317b]"
                                          : "border-gray-300"
                                      }`}
                                    >
                                      {selectedPrescription?.id === prescription.id && (
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Prescription Image */}
                                  <div className="h-20 w-20 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100 flex-shrink-0">
                                    <img
                                      src={
                                        prescription.prescription?.url ||
                                        "/placeholder.svg?height=80&width=80&query=prescription" ||
                                        "/placeholder.svg" ||
                                        "/placeholder.svg" ||
                                        "/placeholder.svg"
                                      }
                                      alt={prescription.patientName}
                                      className="object-cover w-full h-full"
                                    />
                                  </div>

                                  {/* Prescription Details */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                      <h4 className="font-semibold text-gray-900 truncate text-base">
                                        {prescription.patientName}
                                      </h4>
                                      {selectedPrescription?.id === prescription.id && (
                                        <CheckCircle className="h-4 w-4 text-[#14317b] flex-shrink-0" />
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      <p className="flex items-center gap-2">
                                        <User className="h-3 w-3" />
                                        Age: {prescription.patientAge} • {prescription.patientGender}
                                      </p>
                                      <p className="flex items-center gap-2">
                                        <Stethoscope className="h-3 w-3" />
                                        Dr. {prescription.doctorName || "Not specified"}
                                      </p>
                                    </div>
                                    {prescription.status === "REJECTED" && prescription.rejectionMessage && (
                                      <p className="text-xs text-red-600 mt-1 bg-red-50 p-1.5 rounded">
                                        <span className="font-medium">Reason:</span> {prescription.rejectionMessage}
                                      </p>
                                    )}
                                  </div>

                                  {/* Preview Button */}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs bg-transparent px-3 py-1.5"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setPreviewImage(prescription.prescription?.url || null)
                                    }}
                                    disabled={!prescription.prescription?.url}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    Preview
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Dialog Pagination */}
                          {dialogPagination && dialogPagination.totalPages > 1 && (
                            <div className="flex items-center justify-between py-4 border-t border-gray-200">
                              <div className="text-sm text-gray-600">
                                Page {dialogPagination.page} of {dialogPagination.totalPages} ({dialogPagination.total}{" "}
                                total)
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDialogPageChange(dialogCurrentPage - 1)}
                                  disabled={dialogCurrentPage <= 1}
                                  className="text-sm h-8 border-[#14317b]/20 text-[#14317b] hover:bg-[#14317b] hover:text-white"
                                >
                                  <ChevronLeft className="h-3 w-3" />
                                  Previous
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDialogPageChange(dialogCurrentPage + 1)}
                                  disabled={dialogCurrentPage >= dialogPagination.totalPages}
                                  className="text-sm h-8 border-[#14317b]/20 text-[#14317b] hover:bg-[#14317b] hover:text-white"
                                >
                                  Next
                                  <ChevronRight className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}

                          {selectedPrescription && (
                            <div className="bg-[#14317b]/5 border-2 border-[#14317b]/20 rounded-xl p-6">
                              {selectedPrescription.status === "IN_REVIEW" ? (
                                <div className="text-center">
                                  <p className="text-base text-amber-800 font-semibold mb-2">
                                    This prescription already has an order being reviewed
                                  </p>
                                  <p className="text-sm text-amber-600">
                                    Please wait for the current order to be processed
                                  </p>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-gray-900 text-lg">
                                      Create order for {selectedPrescription.patientName}
                                    </p>
                                    <p className="text-base text-gray-600 mt-1">
                                      This will submit your prescription for review and processing
                                    </p>
                                  </div>
                                  <Button
                                    className="bg-[#14317b] hover:bg-[#14317b]/90 ml-4 px-6 py-3 text-base font-semibold"
                                    onClick={() => handleCreateOrder(selectedPrescription.id)}
                                    disabled={createOrderMutation.isPending}
                                  >
                                    {createOrderMutation.isPending ? (
                                      <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                        Creating...
                                      </>
                                    ) : (
                                      <>
                                        <ShoppingCartIcon className="h-5 w-5 mr-3" />
                                        Create Order
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}

                          {!selectedPrescription && (
                            <div className="text-center p-6 bg-gray-50 rounded-xl">
                              <p className="text-base text-gray-600">
                                👆 Select a prescription above to create an order
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="py-12 text-center">
                          <p className="text-base text-gray-500 mb-6">No prescriptions available.</p>
                          <Button
                            onClick={handleUploadNewPrescription}
                            className="bg-[#14317b] hover:bg-[#14317b]/90 px-6 py-3 text-base"
                          >
                            <Plus className="h-5 w-5 mr-3" />
                            Upload First Prescription
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Orders Section */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Order History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isPrescriptionsLoading ? (
              <div className="py-16 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#14317b] mx-auto"></div>
                <p className="text-sm text-gray-500 mt-3">Loading prescription orders...</p>
              </div>
            ) : prescriptions.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {prescriptions.map((prescription: Prescription) => (
                  <Link
                    key={prescription.id}
                    to={`${ORDER_PRESCRIPTION}/${prescription.orderId}`}
                    className="block p-6 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative h-20 w-20 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50 flex-shrink-0">
                          <img
                            src={prescription.prescription?.url || prescriptionImagePath}
                            className="h-full w-full object-cover"
                            alt="Prescription"
                          />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-gray-900 text-lg">{prescription.patientName}</h3>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>Age: {prescription.patientAge}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>Gender: {prescription.patientGender}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Stethoscope className="h-3 w-3" />
                              <span>Dr. {prescription.doctorName}</span>
                            </div>
                            {prescription.orderId && (
                              <div className="flex items-center gap-1">
                                <span>Order: #{prescription.orderId}</span>
                              </div>
                            )}
                          </div>
                          {prescription.status === "REJECTED" && prescription.rejectionReason && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-2 mt-2">
                              <p className="text-sm text-red-700">
                                <span className="font-medium">Rejection Reason:</span> {prescription.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getPrescriptionStatus(prescription.status)}
                        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="p-6 bg-gray-50 rounded-lg mx-6 mb-6">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No prescription orders yet</h3>
                  <p className="text-sm text-gray-600 mb-4">Create your first prescription order to get started</p>
                </div>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-6 border-t bg-gray-50">
                <div className="text-sm text-gray-600">
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total orders)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="flex items-center gap-1 border-[#14317b]/20 text-[#14317b] hover:bg-[#14317b] hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= pagination.totalPages}
                    className="flex items-center gap-1 border-[#14317b]/20 text-[#14317b] hover:bg-[#14317b] hover:text-white"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Prescription Preview</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center p-4">
              <img
                src={previewImage || "/placeholder.svg"}
                alt="Prescription Preview"
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default OrderPrescription
