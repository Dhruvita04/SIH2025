"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Download } from "lucide-react"

interface PrescriptionModalProps {
  isOpen: boolean
  onClose: () => void
  prescriptionDetails: any
  orderNumber: string
}

export default function PrescriptionModal({
  isOpen,
  onClose,
  prescriptionDetails,
  orderNumber,
}: PrescriptionModalProps) {
  const [zoomLevel, setZoomLevel] = useState(1)

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
  }

  const resetZoom = () => {
    setZoomLevel(1)
  }

  const handleDownloadPrescription = async () => {
    if (prescriptionDetails?.prescriptionUrl) {
      try {
        const response = await fetch(prescriptionDetails.prescriptionUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `prescription-${prescriptionDetails.patientName}-${orderNumber}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error("Download failed:", error)
        const link = document.createElement("a")
        link.href = prescriptionDetails.prescriptionUrl
        link.download = `prescription-${prescriptionDetails.patientName}-${orderNumber}.jpg`
        link.target = "_blank"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Prescription - {prescriptionDetails?.patientName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{Math.round(zoomLevel * 100)}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoomLevel >= 3}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={resetZoom}>
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPrescription}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
          <div className="overflow-auto max-h-[60vh] border rounded-lg">
            <img
              src={prescriptionDetails?.prescriptionUrl || "/placeholder.svg?height=600&width=400"}
              alt="Prescription"
              className="transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
