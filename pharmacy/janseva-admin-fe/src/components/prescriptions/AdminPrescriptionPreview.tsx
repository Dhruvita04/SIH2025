"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Phone, ZoomIn, User, Calendar, Stethoscope, UserCheck, Droplets, Ruler, Weight } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { PRESCRIPTION_API } from "@/utils/API-ROUTES"
import axiosInstance from "@/utils/API"
import { useQuery } from "@tanstack/react-query"
import type { PrescriptionStatus } from "./types"
import { format } from "date-fns"

export function AdminPrescriptionPreview({
  prescriptionId,
  handleStatusUpload,
  isUploading,
}: {
  prescriptionId: string
  handleStatusUpload: (status: PrescriptionStatus, rejectionReason?: string) => void
  isUploading: boolean
}) {
  const [status, setStatus] = useState<PrescriptionStatus>("APPROVED")
  const [rejectionReason, setRejectionReason] = useState("")

  const handleStatusChange = (newStatus: PrescriptionStatus) => {
    setStatus(newStatus)
  }

  const handleSubmit = () => {
    handleStatusUpload(status, rejectionReason)
  }

  const { data: prescription, isLoading } = useQuery({
    queryKey: ["prescription", prescriptionId],
    queryFn: async () => {
      const response = await axiosInstance.get(`${PRESCRIPTION_API}/${prescriptionId}`)
      return response.data.data
    },
    enabled: !!prescriptionId,
    refetchOnMount: true,
  })

  if (isLoading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">Loading prescription details...</p>
        </div>
      </div>
    )
  }

  if (!prescription) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">No prescription found</p>
          <p className="text-gray-400 text-sm mt-1">The requested prescription could not be loaded</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200"
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200"
      case "IN_REVIEW":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prescription Review</h1>
          <p className="text-gray-600 mt-1">Review and approve prescription details</p>
        </div>
        <Badge className={`px-3 py-1 text-sm font-medium ${getStatusColor(prescription.status || "IN_REVIEW")}`}>
          {prescription.status || "IN_REVIEW"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prescription Image */}
        <div className="lg:col-span-1">
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                Prescription Image
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative group">
                <img
                  src={prescription.prescriptionUrl || "/placeholder.svg?height=400&width=300&query=prescription"}
                  alt="Prescription"
                  className="w-full h-80 object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
                    <img
                      src={prescription.prescriptionUrl || "/placeholder.svg?height=800&width=600&query=prescription"}
                      alt="Prescription"
                      className="w-full h-auto object-contain"
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient & Doctor Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Patient Name</p>
                      <p className="font-semibold text-gray-900">{prescription.patientName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-semibold text-gray-900">{prescription.patientAge} years</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-semibold text-gray-900 capitalize">{prescription.patientGender}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Droplets className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Blood Group</p>
                      <p className="font-semibold text-gray-900">{prescription.patientBloodGroup || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Ruler className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Height</p>
                      <p className="font-semibold text-gray-900">
                        {prescription.patientHeight ? `${prescription.patientHeight} cm` : "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <Weight className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Weight</p>
                      <p className="font-semibold text-gray-900">
                        {prescription.patientWeight ? `${prescription.patientWeight} kg` : "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Doctor & Contact Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                Doctor & Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Doctor Name</p>
                    <p className="font-semibold text-gray-900 text-lg">Dr. {prescription.doctorName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Prescription Date</p>
                    <p className="font-semibold text-gray-900">
                      {format(new Date(prescription.updatedAt), "dd MMM yyyy, hh:mm a")}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Patient Contact</p>
                    <div className="flex items-center space-x-3">
                      <p className="font-semibold text-gray-900">{prescription.userPhone || "Not provided"}</p>
                      {prescription.userPhone && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 bg-transparent"
                          onClick={() => (window.location.href = `tel:${prescription.userPhone}`)}
                        >
                          <Phone className="h-4 w-4" />
                          <span className="sr-only">Call patient</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Decision Section */}
      <Card className="border-2 border-dashed border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-center">Review Decision</CardTitle>
          <p className="text-gray-600 text-center">Please review the prescription and make your decision</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label htmlFor="status" className="font-semibold text-gray-700 min-w-[100px]">
              Decision:
            </label>
            <Select onValueChange={handleStatusChange} value={status}>
              <SelectTrigger id="status" className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select decision" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APPROVED" className="text-green-700">
                  ✓ Approve Prescription
                </SelectItem>
                <SelectItem value="REJECTED" className="text-red-700">
                  ✗ Reject Prescription
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status === "REJECTED" && (
            <div className="space-y-2">
              <label htmlFor="rejection-reason" className="font-semibold text-gray-700">
                Reason for Rejection <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="rejection-reason"
                placeholder="Please provide a detailed reason for rejecting this prescription..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <p className="text-sm text-gray-500">This reason will be shared with the patient.</p>
            </div>
          )}

          <Separator />

          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={isUploading || (status === "REJECTED" && !rejectionReason.trim())}
              className={`px-8 py-2 font-semibold ${
                status === "APPROVED"
                  ? "bg-green-600 hover:bg-green-700"
                  : status === "REJECTED"
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
              }`}
              size="lg"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {status === "APPROVED"
                    ? "✓ Approve Prescription"
                    : status === "REJECTED"
                      ? "✗ Reject Prescription"
                      : "Select Decision"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
 