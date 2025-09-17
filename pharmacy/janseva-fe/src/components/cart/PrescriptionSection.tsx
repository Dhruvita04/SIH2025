"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, Eye, X } from "lucide-react"
import { PrescriptionDialog } from "./PrescriptionDialog"
import { PreviewDialog } from "./PreviewDialog"
import type { Prescription } from "./types"
import useCartFacade from "@/facades/useCartFacade"
import { useQuery, useMutation } from "@tanstack/react-query"
import axiosInstance from "@/utils/API"
import { CART_CHANGE_PRESCRIPTION } from "@/CONFIG/api-routes"
import useAuthFacade from "@/facades/useAuthFacade"
import { toast } from "react-hot-toast"
import { useEffect } from "react"

interface PrescriptionSectionProps {
  prescriptionId?: string | null
  onPrescriptionSelect?: (prescription: Prescription | null) => void
}

export function PrescriptionSection({ prescriptionId, onPrescriptionSelect }: PrescriptionSectionProps) {
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const { prescription, setPrescription, setPrescriptionId } = useCartFacade()
  const { user, isAuthenticated } = useAuthFacade()

  const removePrescriptionMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated || !user?.id) {
        throw new Error("User not authenticated")
      }

      const response = await axiosInstance.patch(CART_CHANGE_PRESCRIPTION, {
        userId: user.id,
        prescriptionId: null, // Pass null to remove prescription
      })
      return response.data
    },
    onSuccess: () => {
      toast.success("Prescription removed successfully")
    },
    onError: (error: any) => {
      console.error("Failed to remove prescription:", error)
      toast.error("Failed to remove prescription")
    },
  })

  const { data: prescriptionData, isLoading } = useQuery({
    queryKey: ["prescription", prescriptionId],
    queryFn: async () => {
      if (!prescriptionId) return null
      const response = await axiosInstance.get(`/prescription/${prescriptionId}`)
      return response.data.data
    },
    enabled: !!prescriptionId,
  })

  useEffect(() => {
    if (prescriptionData) {
      const mappedPrescription: Prescription = {
        id: prescriptionData.id,
        userId: prescriptionData.userId,
        createdAt: prescriptionData.createdAt,
        updatedAt: prescriptionData.updatedAt,
        patientAge: prescriptionData.patientAge,
        patientBloodGroup: prescriptionData.patientBloodGroup,
        patientGender: prescriptionData.patientGender,
        patientHeight: prescriptionData.patientHeight,
        patientName: prescriptionData.patientName,
        patientWeight: prescriptionData.patientWeight,
        prescriptionUrl: prescriptionData.prescriptionUrl,
        doctorName: prescriptionData.doctorName,
        prescription: {
          url: prescriptionData.prescriptionUrl,
          path: prescriptionData.prescriptionUrl,
          hasError: prescriptionData.hasUrlError || false,
          errorMessage: prescriptionData.errorMessage || null,
        },
        status: "UPLOADED" as const,
        orderId: null,
        orderCreatedAt: null,
        rejectionReason: null,
        rejectionMessage: null,
      }
      setPrescription(mappedPrescription)

      if (onPrescriptionSelect) {
        onPrescriptionSelect(mappedPrescription)
      }
    }
  }, [prescriptionData, setPrescription, onPrescriptionSelect])

  const handleSelectPrescription = (selectedPrescription: Prescription) => {
    setPrescription(selectedPrescription)
    setShowPrescriptionDialog(false)

    if (onPrescriptionSelect) {
      onPrescriptionSelect(selectedPrescription)
    }
  }

  const handleRemovePrescription = () => {
    setPrescription(null as any)
    setPrescriptionId(null)

    if (onPrescriptionSelect) {
      onPrescriptionSelect(null)
    }

    if (isAuthenticated && user?.id) {
      removePrescriptionMutation.mutate()
    }
  }

  if (isLoading && prescriptionId) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-2xl font-medium">Prescription</h3>
          </div>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-gray-600">Loading prescription...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-2xl font-medium">Prescription</h3>
            {prescription && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemovePrescription}
                className="text-gray-500 hover:text-red-600 h-8 w-8 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {prescription ? (
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
              <div className="w-12 h-12 rounded-md overflow-hidden border bg-white flex-shrink-0">
                <img
                  src={prescription.prescription?.url || "/placeholder.svg?height=48&width=48&query=prescription"}
                  alt={prescription.patientName}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-xl font-medium text-gray-900">{prescription.patientName}</h4>
                  <span className="text-lg text-gray-500">•</span>
                  <span className="text-lg text-gray-600">
                    Age {prescription.patientAge} • {prescription.patientGender}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-lg text-gray-600">
                  <span>
                    {new Date(prescription.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {prescription.doctorName && (
                    <>
                      <span>•</span>
                      <span>Dr. {prescription.doctorName}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewImage(prescription.prescription?.url || null)}
                  disabled={!prescription.prescription?.url}
                  className="h-9 px-4 text-base"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPrescriptionDialog(true)}
                  className="h-9 px-4 text-base"
                >
                  Change
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-10 w-10 text-gray-400" />
                <div>
                  <p className="text-xl font-medium text-gray-900">No prescription selected</p>
                  <p className="text-lg text-gray-600">Required for prescription medicines</p>
                </div>
              </div>
              <Button onClick={() => setShowPrescriptionDialog(true)} size="sm" className="text-base px-4 h-9">
                <Upload className="mr-2 h-4 w-4" />
                Select Prescription
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <PrescriptionDialog
        isOpen={showPrescriptionDialog}
        onClose={() => setShowPrescriptionDialog(false)}
        onSelect={handleSelectPrescription}
      />

      {previewImage && (
        <PreviewDialog isOpen={!!previewImage} onClose={() => setPreviewImage(null)} imageUrl={previewImage} />
      )}
    </>
  )
}
