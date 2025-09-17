"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { toast } from "react-hot-toast"
import axiosInstance from "@/utils/API"
import { ORDERS_API, BATCH_SUGGESTIONS_API } from "@/utils/API-ROUTES"

type OrderStatus = "PLACED" | "SHIPPED" | "IN_TRANSIT" | "DELIVERED" | "RETURNED" | "REFUNDED"

interface BatchSuggestion {
  id: string
  batchNo: string
  expiryDate: string
}

interface StatusUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  order: any
  selectedStatus: OrderStatus | undefined
  setSelectedStatus: (status: OrderStatus | undefined) => void
  trackingURL: string
  setTrackingURL: (url: string) => void
  trackingNumber: string
  setTrackingNumber: (number: string) => void
  courierName: string
  setCourierName: (name: string) => void
  batchDetails: any
  setBatchDetails: any
  batchSuggestions: any
  setBatchSuggestions: any
  onSuccess: () => void
}

export default function StatusUpdateModal({
  isOpen,
  onClose,
  order,
  selectedStatus,
  setSelectedStatus,
  trackingURL,
  setTrackingURL,
  trackingNumber,
  setTrackingNumber,
  courierName,
  setCourierName,
  batchDetails,
  setBatchDetails,
  batchSuggestions,
  setBatchSuggestions,
  onSuccess,
}: StatusUpdateModalProps) {
  const [shippedModalStep, setShippedModalStep] = useState<1 | 2>(1)
  const [isLoading, setIsLoading] = useState(false)

  const fetchBatchSuggestions = async (productId: string, variantId: string) => {
    const suggestionKey = `${productId}-${variantId}`

    if (batchSuggestions[suggestionKey] && batchSuggestions[suggestionKey].length > 0) {
      return
    }

    try {
      const response = await axiosInstance.post(BATCH_SUGGESTIONS_API, {
        productId,
        variantId,
      })

      if (response.data.status === "success" && response.data.data) {
        const suggestions =
          response.data.data.map((item: any) => ({
            id: item.id,
            batchNo: item.batchNo,
            expiryDate: item.expiryDate,
          })) || []

        setBatchSuggestions((prev: any) => ({
          ...prev,
          [suggestionKey]: suggestions,
        }))

        if (suggestions.length === 0) {
          setBatchSuggestions((prev: any) => ({
            ...prev,
            [suggestionKey]: [],
          }))
        }
      } else {
        setBatchSuggestions((prev: any) => ({
          ...prev,
          [suggestionKey]: [],
        }))
      }
    } catch (error) {
      console.error("Failed to fetch batch suggestions:", error)
      setBatchSuggestions((prev: any) => ({
        ...prev,
        [suggestionKey]: [],
      }))
    }
  }

  const handleBatchSuggestionSelect = (orderProductId: string, batchIndex: number, suggestion: BatchSuggestion) => {
    updateBatchDetail(orderProductId, batchIndex, "batchNumber", suggestion.batchNo)
    const formattedDate = new Date(suggestion.expiryDate).toISOString().split("T")[0]
    updateBatchDetail(orderProductId, batchIndex, "expiryDate", formattedDate)
  }

  const getRemainingQuantity = (orderProductId: string, orderQuantity: number) => {
    const productBatches = batchDetails[orderProductId] || []
    const totalBatchQuantity = productBatches.reduce((sum: number, batch: any) => sum + batch.quantity, 0)
    return orderQuantity - totalBatchQuantity
  }

  const addBatchForProduct = (orderProductId: string, orderQuantity: number) => {
    const remainingQuantity = getRemainingQuantity(orderProductId, orderQuantity)
    if (remainingQuantity <= 0) return

    setBatchDetails((prev: any) => ({
      ...prev,
      [orderProductId]: [
        ...(prev[orderProductId] || []),
        { batchNumber: "", quantity: remainingQuantity, expiryDate: "" },
      ],
    }))
  }

  const removeBatchForProduct = (orderProductId: string, batchIndex: number) => {
    setBatchDetails((prev: any) => ({
      ...prev,
      [orderProductId]: (prev[orderProductId] || []).filter((_: any, index: number) => index !== batchIndex),
    }))
  }

  const updateBatchDetail = (orderProductId: string, batchIndex: number, field: string, value: string | number) => {
    setBatchDetails((prev: any) => ({
      ...prev,
      [orderProductId]: (prev[orderProductId] || []).map((batch: any, index: number) =>
        index === batchIndex ? { ...batch, [field]: value } : batch,
      ),
    }))
  }

  const handleQuantityChange = (orderProductId: string, batchIndex: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "")
    let quantity = numericValue === "" ? 1 : Number.parseInt(numericValue, 10)

    if (quantity <= 0) {
      quantity = 1
    }

    updateBatchDetail(orderProductId, batchIndex, "quantity", quantity)
  }

  const handleShippedNextStep = () => {
    if (!order) {
      toast.error("Order data not available.")
      return
    }

    for (const orderProduct of order.products) {
      const productBatches = batchDetails[orderProduct.id] || []

      if (productBatches.length === 0) {
        toast.error(`Please add at least one batch for ${orderProduct.product.name}`)
        return
      }

      const totalBatchQuantity = productBatches.reduce((sum: number, batch: any) => sum + batch.quantity, 0)
      if (totalBatchQuantity !== orderProduct.quantity) {
        toast.error(
          `Total batch quantity (${totalBatchQuantity}) must equal order quantity (${orderProduct.quantity}) for ${orderProduct.product.name}`,
        )
        return
      }

      for (const [index, batch] of productBatches.entries()) {
        if (!batch.batchNumber || !batch.batchNumber.trim()) {
          toast.error(`Please enter batch number for ${orderProduct.product.name} (Batch ${index + 1})`)
          return
        }
        if (!batch.expiryDate) {
          toast.error(`Please select expiry date for ${orderProduct.product.name} (Batch ${index + 1})`)
          return
        }
        if (batch.quantity <= 0) {
          toast.error(`Quantity must be greater than 0 for ${orderProduct.product.name} (Batch ${index + 1})`)
          return
        }
      }

      const batchNumbers = productBatches.map((b: any) => b.batchNumber.trim())
      const duplicates = batchNumbers.filter((item: string, index: number) => batchNumbers.indexOf(item) !== index)
      if (duplicates.length > 0) {
        toast.error(`Duplicate batch number "${duplicates[0]}" found for ${orderProduct.product.name}`)
        return
      }
    }

    setShippedModalStep(2)
  }

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      toast.error("Please select a new status.")
      return
    }

    if (!order) {
      toast.error("Order data not available.")
      return
    }

    const payload: any = { status: selectedStatus }

    if (selectedStatus === "SHIPPED") {
      if (!trackingURL || !trackingNumber || !courierName) {
        toast.error("Tracking URL, tracking number, and courier name are required when status is SHIPPED.")
        return
      }
      payload.trackingURL = trackingURL
      payload.trackingNumber = trackingNumber
      payload.courierName = courierName

      const shippedBatches: Array<{
        orderProductId: string
        batchNumber: string
        expiryDate: string
        quantity: number
      }> = []

      for (const orderProduct of order.products) {
        const productBatches = batchDetails[orderProduct.id] || []

        if (productBatches.length === 0) {
          toast.error(`Please add at least one batch for ${orderProduct.product.name}`)
          return
        }

        const totalBatchQuantity = productBatches.reduce((sum: number, batch: any) => sum + batch.quantity, 0)
        if (totalBatchQuantity !== orderProduct.quantity) {
          toast.error(
            `Total batch quantity (${totalBatchQuantity}) must equal order quantity (${orderProduct.quantity}) for ${orderProduct.product.name}`,
          )
          return
        }

        for (const [index, batch] of productBatches.entries()) {
          if (!batch.batchNumber || !batch.batchNumber.trim()) {
            toast.error(`Please enter batch number for ${orderProduct.product.name} (Batch ${index + 1})`)
            return
          }
          if (!batch.expiryDate) {
            toast.error(`Please select expiry date for ${orderProduct.product.name} (Batch ${index + 1})`)
            return
          }
          if (batch.quantity <= 0) {
            toast.error(`Quantity must be greater than 0 for ${orderProduct.product.name} (Batch ${index + 1})`)
            return
          }

          const duplicateBatch = shippedBatches.find(
            (sb) => sb.orderProductId === orderProduct.id && sb.batchNumber === batch.batchNumber.trim(),
          )
          if (duplicateBatch) {
            toast.error(`Duplicate batch number "${batch.batchNumber}" found for ${orderProduct.product.name}`)
            return
          }

          shippedBatches.push({
            orderProductId: orderProduct.id,
            batchNumber: batch.batchNumber.trim(),
            expiryDate: batch.expiryDate,
            quantity: batch.quantity,
          })
        }
      }

      payload.shippedBatches = shippedBatches
    }

    setIsLoading(true)
    try {
      await axiosInstance.put(`${ORDERS_API}/${order.id}/status`, payload)
      toast.success("Order status updated successfully")
      onSuccess()
      onClose()
      setShippedModalStep(1)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update order status"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    setShippedModalStep(1)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedStatus === "SHIPPED"
              ? `Update Order Status - Step ${shippedModalStep} of 2`
              : "Update Order Status"}
          </DialogTitle>
        </DialogHeader>

        {selectedStatus !== "SHIPPED" ? (
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status-select">Select New Status</Label>
              <Select value={selectedStatus} onValueChange={(value: OrderStatus) => setSelectedStatus(value)}>
                <SelectTrigger id="status-select">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {order.availableStatuses.map((statusOption: OrderStatus) => (
                    <SelectItem key={statusOption} value={statusOption}>
                      {statusOption.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <>
            {shippedModalStep === 1 ? (
              <div className="space-y-4 py-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Step 1:</strong> Please add batch details for all products before proceeding to shipping
                    information.
                  </p>
                </div>

                {order?.products.map((orderProduct: any) => {
                  const remainingQuantity = getRemainingQuantity(orderProduct.id, orderProduct.quantity)
                  const canAddBatch = remainingQuantity > 0

                  return (
                    <div key={orderProduct.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={orderProduct.product.images[0] || "/placeholder.svg?height=50&width=50"}
                            alt={orderProduct.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <h5 className="font-medium">{orderProduct.product.name}</h5>
                            <p className="text-sm text-gray-500">
                              {orderProduct.variant.name} - Order Quantity: {orderProduct.quantity}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addBatchForProduct(orderProduct.id, orderProduct.quantity)}
                          disabled={!canAddBatch}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Batch
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="grid grid-cols-4 gap-3 text-xs font-medium text-gray-600 px-3">
                          <div>Batch Number</div>
                          <div>Quantity</div>
                          <div>Expiry Date</div>
                          <div>Action</div>
                        </div>

                        {(batchDetails[orderProduct.id] || []).map((batch: any, batchIndex: number) => {
                          const suggestionKey = `${orderProduct.product.id}-${orderProduct.variant.id}`
                          const suggestions = batchSuggestions[suggestionKey] || []

                          return (
                            <div key={batchIndex} className="grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded">
                              <div className="relative">
                                <Input
                                  placeholder="Enter batch number"
                                  value={batch.batchNumber}
                                  onChange={(e) => {
                                    updateBatchDetail(orderProduct.id, batchIndex, "batchNumber", e.target.value)
                                    if (e.target.value.trim()) {
                                      fetchBatchSuggestions(orderProduct.product.id, orderProduct.variant.id)
                                    }
                                  }}
                                  onFocus={() => {
                                    fetchBatchSuggestions(orderProduct.product.id, orderProduct.variant.id)
                                  }}
                                  className={!batch.batchNumber?.trim() ? "border-red-300 focus:border-red-500" : ""}
                                />
                                {suggestions.length > 0 && (
                                  <div className="absolute top-full left-0 z-50 mt-1 w-80 min-w-full">
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                                      <div className="px-4 py-3 text-sm font-semibold text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                                        📦 Available Batch Numbers
                                      </div>
                                      <div className="max-h-48 overflow-y-auto">
                                        {suggestions.map((suggestion: BatchSuggestion, idx: number) => (
                                          <div
                                            key={suggestion.id || idx}
                                            className="px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer border-b border-gray-50 last:border-b-0 transition-all duration-200 hover:shadow-sm"
                                            onClick={() =>
                                              handleBatchSuggestionSelect(orderProduct.id, batchIndex, suggestion)
                                            }
                                          >
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-sm"></div>
                                                <span className="font-semibold text-gray-900 text-sm">
                                                  {suggestion.batchNo}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">Expires:</span>
                                                <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                                                  {new Date(suggestion.expiryDate).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                  })}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <Input
                                type="text"
                                placeholder="Quantity"
                                value={batch.quantity.toString()}
                                onChange={(e) => handleQuantityChange(orderProduct.id, batchIndex, e.target.value)}
                                className={batch.quantity <= 0 ? "border-red-300 focus:border-red-500" : ""}
                                min="1"
                              />
                              <Input
                                type="date"
                                value={batch.expiryDate}
                                onChange={(e) =>
                                  updateBatchDetail(orderProduct.id, batchIndex, "expiryDate", e.target.value)
                                }
                                className={!batch.expiryDate ? "border-red-300 focus:border-red-500" : ""}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeBatchForProduct(orderProduct.id, batchIndex)}
                                disabled={(batchDetails[orderProduct.id] || []).length <= 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        })}
                      </div>

                      <div className="text-sm bg-blue-50 p-2 rounded">
                        <span className="text-gray-700">
                          Total batch quantity:{" "}
                          <span className="font-medium">
                            {(batchDetails[orderProduct.id] || []).reduce(
                              (sum: number, batch: any) => sum + batch.quantity,
                              0,
                            )}
                          </span>{" "}
                          / <span className="font-medium">{orderProduct.quantity}</span>
                        </span>
                        {remainingQuantity > 0 && (
                          <span className="text-blue-600 ml-2 font-medium">(Remaining: {remainingQuantity})</span>
                        )}
                        {(batchDetails[orderProduct.id] || []).reduce(
                          (sum: number, batch: any) => sum + batch.quantity,
                          0,
                        ) !== orderProduct.quantity && (
                          <span className="text-red-600 ml-2 font-medium">(Must equal order quantity)</span>
                        )}

                        {(batchDetails[orderProduct.id] || []).some((batch: any) => !batch.batchNumber?.trim()) && (
                          <div className="text-red-600 text-xs mt-1">⚠ Missing batch numbers</div>
                        )}
                        {(batchDetails[orderProduct.id] || []).some((batch: any) => !batch.expiryDate) && (
                          <div className="text-red-600 text-xs mt-1">⚠ Missing expiry dates</div>
                        )}
                        {(batchDetails[orderProduct.id] || []).some((batch: any) => batch.quantity <= 0) && (
                          <div className="text-red-600 text-xs mt-1">⚠ Invalid quantities (must be greater than 0)</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Step 2:</strong> Please enter shipping tracking details. Batch information is shown below
                    for reference.
                  </p>
                </div>

                <div className="space-y-4 border rounded-lg p-4">
                  <h4 className="font-semibold text-lg">Shipping Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="trackingNumber">Tracking Number</Label>
                      <Input
                        id="trackingNumber"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Enter tracking number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="courierName">Courier Name</Label>
                      <Input
                        id="courierName"
                        value={courierName}
                        onChange={(e) => setCourierName(e.target.value)}
                        placeholder="Enter courier name"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="trackingURL">Tracking URL</Label>
                      <Input
                        id="trackingURL"
                        value={trackingURL}
                        onChange={(e) => setTrackingURL(e.target.value)}
                        placeholder="Enter tracking URL"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border rounded-lg p-4">
                  <h4 className="font-semibold text-lg">Batch Information (Read-only)</h4>
                  {order?.products.map((orderProduct: any) => {
                    const productBatches = batchDetails[orderProduct.id] || []
                    if (productBatches.length === 0) return null

                    return (
                      <div key={orderProduct.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={orderProduct.product.images[0] || "/placeholder.svg?height=40&width=40"}
                            alt={orderProduct.product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div>
                            <h5 className="font-medium text-sm">{orderProduct.product.name}</h5>
                            <p className="text-xs text-gray-500">{orderProduct.variant.name}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {productBatches.map((batch: any, index: number) => (
                            <div key={index} className="bg-white rounded p-2 text-sm">
                              <div className="space-y-1">
                                <div>
                                  <span className="text-xs text-gray-600">Batch:</span>
                                  <span className="font-mono ml-1">{batch.batchNumber}</span>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-600">Qty:</span>
                                  <span className="ml-1">{batch.quantity}</span>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-600">Expiry:</span>
                                  <span className="ml-1">{format(new Date(batch.expiryDate), "dd MMM yyyy")}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <DialogFooter>
          {selectedStatus === "SHIPPED" ? (
            shippedModalStep === 1 ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleShippedNextStep}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Next: Tracking Details
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShippedModalStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back: Batch Details
                </Button>
                <Button onClick={handleUpdateStatus} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update to SHIPPED"
                  )}
                </Button>
              </div>
            )
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleUpdateStatus} disabled={isLoading || !selectedStatus}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
