"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ZoomIn, ZoomOut, Download } from "lucide-react"

interface PreviewDialogProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
}

export function PreviewDialog({ isOpen, onClose, imageUrl }: PreviewDialogProps) {
  const [zoomLevel, setZoomLevel] = useState(1)

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `prescription-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading image:", error)
    }
  }

  const handleClose = () => {
    setZoomLevel(1) // Reset zoom when closing
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Prescription Preview</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">{Math.round(zoomLevel * 100)}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoomLevel >= 3}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            {/* <Button variant="outline" size="sm" onClick={resetZoom}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button> */}
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          {/* Image Container */}
          <div className="overflow-auto max-h-[60vh] border rounded-lg bg-muted/30 p-4">
            <img
              src={imageUrl || "/placeholder.svg?height=600&width=400&query=prescription"}
              alt="Prescription"
              className="transition-transform duration-200 max-w-none"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "center center",
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=600&width=400"
              }}
            />
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Use zoom controls to adjust the view • Click download to save the prescription</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
