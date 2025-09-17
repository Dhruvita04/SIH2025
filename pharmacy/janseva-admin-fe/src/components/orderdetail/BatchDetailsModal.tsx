"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"
import axiosInstance from "@/utils/API"
import { ORDERS_API, BATCH_SUGGESTIONS_API } from "@/utils/API-ROUTES"

interface BatchSuggestion {
  id: string
  batchNo: string
  expiryDate: string
}

interface BatchDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "add" | "update"
  order: any
  batchDetails: any
  setBatchDetails: any
  batchSuggestions: any
  setBatchSuggestions: any
  onSuccess: () => void
}

export default function BatchDetailsModal({
  isOpen,
  onClose,
  mode,
  order,
  batchDetails,
  setBatchDetails,
  batchSuggestions,
  setBatchSuggestions,
  onSuccess,
}: BatchDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)

  const fetchBatchSuggestions = async (productId: string, variantId: string, search = "") => {
    const suggestionKey = `${productId}-${variantId}`

    // Don't fetch if we already have suggestions and no search term
    if (!search && batchSuggestions[suggestionKey] && batchSuggestions[suggestionKey].length > 0) {
      return
    }

    try {
      const response = await axiosInstance.post(BATCH_SUGGESTIONS_API, {
        productId,
        variantId,
        batchNo: search.trim(), // Include batchNo parameter instead of search
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
    setFocusedInput(null)
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

  const handleSaveBatches = async () => {
    if (!order) {
      toast.error("Order data not available.")
      return
    }

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

    setIsLoading(true)
    try {
      const endpoint = mode === "add" ? `${ORDERS_API}/${order.id}/batches` : `${ORDERS_API}/${order.id}/batches`
      const method = mode === "add" ? "post" : "put"

      await axiosInstance[method](endpoint, { shippedBatches })

      toast.success(`Batches ${mode === "add" ? "added" : "updated"} successfully`)
      onSuccess()
      onClose()
    } catch (error: any) {
      let errorMessage = `Failed to ${mode} batches`

      if (error.response?.data?.message) {
        const apiErrorMessage = error.response.data.message
        if (apiErrorMessage.includes("Unique constraint failed") && apiErrorMessage.includes("batchNo")) {
          errorMessage = "Batch number already exists for this product variant. Please use a different batch number."
        } else if (apiErrorMessage.includes("PrismaClientKnownRequestError")) {
          errorMessage = "Database error occurred. Please check your batch details and try again."
        } else {
          errorMessage = apiErrorMessage
        }
      }

      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add Batch Details" : "Update Batch Details"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              Please {mode === "add" ? "add" : "update"} batch details for all products. Each product's total batch
              quantity must equal its order quantity.
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
                    const inputId = `${orderProduct.id}-${batchIndex}`
                    const showSuggestions = focusedInput === inputId && suggestions.length > 0

                    return (
                      <div key={batchIndex} className="grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded">
                        <div className="relative">
                          <Input
                            placeholder="Enter batch number"
                            value={batch.batchNumber}
                            onChange={(e) => {
                              updateBatchDetail(orderProduct.id, batchIndex, "batchNumber", e.target.value)
                              setFocusedInput(inputId)
                              fetchBatchSuggestions(orderProduct.product.id, orderProduct.variant.id, e.target.value)
                            }}
                            onFocus={() => {
                              setFocusedInput(inputId)
                              fetchBatchSuggestions(orderProduct.product.id, orderProduct.variant.id, batch.batchNumber)
                            }}
                            onBlur={(e) => {
                              const relatedTarget = e.relatedTarget as HTMLElement
                              if (!relatedTarget || !relatedTarget.closest(".suggestions-dropdown")) {
                                setTimeout(() => {
                                  setFocusedInput((prev) => (prev === inputId ? null : prev))
                                }, 150)
                              }
                            }}
                            className={!batch.batchNumber?.trim() ? "border-red-300 focus:border-red-500" : ""}
                          />
                          {showSuggestions && (
                            <div className="absolute top-full left-0 z-[9999] mt-1 w-80 min-w-full suggestions-dropdown">
                              <div className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                                <div className="max-h-48 overflow-y-auto">
                                  {suggestions.map((suggestion: BatchSuggestion, idx: number) => (
                                    <div
                                      key={suggestion.id || idx}
                                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-50 last:border-b-0 transition-all duration-200 hover:shadow-sm"
                                      onMouseDown={(e) => {
                                        e.preventDefault()
                                        handleBatchSuggestionSelect(orderProduct.id, batchIndex, suggestion)
                                      }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="w-3 h-3 rounded-full bg-black shadow-sm"></div>
                                          <span className="font-semibold text-gray-900 text-sm">
                                            {suggestion.batchNo}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-gray-500">Expires:</span>
                                          <span className="text-sm font-medium text-white bg-black px-3 py-1 rounded-full">
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
                          onChange={(e) => updateBatchDetail(orderProduct.id, batchIndex, "expiryDate", e.target.value)}
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
        <DialogFooter>
          <Button onClick={handleSaveBatches} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "add" ? "Adding..." : "Updating..."}
              </>
            ) : mode === "add" ? (
              "Add Batches"
            ) : (
              "Update Batches"
            )}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
