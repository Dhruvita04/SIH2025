"use client"

import useSingleProductFacade from "@/facades/useSingleProductFacade"
import { Button } from "../ui/button"
import { Dialog, DialogTitle, DialogHeader, DialogContent, DialogTrigger } from "../ui/dialog"
import PopupProductCard from "./PopupProductCard"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { useState } from "react"
import { getPriceBasedOnDiscountType } from "@/utils/helperFunctions"

function AlternativeProduct() {
  const {
    productDetails,
    productAlternative: alternativeDetails,
    productVariations: variationsDetails,
  } = useSingleProductFacade()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [showDialogSavings, setShowDialogSavings] = useState(false)

  const calculateSavings = () => {
    if (!alternativeDetails || !variationsDetails) return 0
    return Math.abs(
      Number.parseFloat(
        getPriceBasedOnDiscountType(
          alternativeDetails.price,
          alternativeDetails.discount,
          alternativeDetails.discountType,
        ),
      ) -
        Number.parseFloat(
          getPriceBasedOnDiscountType(
            variationsDetails[0].price,
            variationsDetails[0].discount,
            variationsDetails[0].discountType,
          ),
        ),
    ).toFixed(2)
  }

  const handleCompareClick = () => {
    setDialogOpen(true)
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
    setShowDialogSavings(true)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {alternativeDetails && (
          <div className="relative mt-4">
            <Button className="w-full py-5 bg-green-500 hover:bg-green-600" onClick={handleCompareClick}>
              Compare Branded Alternative
            </Button>
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">Product Comparison</DialogTitle>
        </DialogHeader>
        <AnimatePresence>
          {showDialogSavings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full py-5 mb-4 bg-green-100 rounded-lg shadow-lg"
            >
              <motion.p
                className="text-center text-green-700 font-bold"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                You can save ₹{calculateSavings()} with the alternative!
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="grid grid-cols-2 gap-6">
          {productDetails && variationsDetails && (
            <PopupProductCard
              id={productDetails.id}
              productImagePath={productDetails.images[0]}
              name={productDetails.name}
              companyName={productDetails.brand}
              price={variationsDetails[0].price}
              discount={variationsDetails[0].discount}
              discountType={variationsDetails[0].discountType}
              isCurrentProduct={true}
              composition={productDetails.composition || ""}
              alternativeProduct={alternativeDetails}
            />
          )}
          {alternativeDetails && (
            <PopupProductCard
              id={alternativeDetails.id}
              productImagePath={alternativeDetails.imageUrl}
              name={alternativeDetails.productName}
              companyName={alternativeDetails.companyName}
              price={alternativeDetails.price}
              discount={alternativeDetails.discount}
              discountType={alternativeDetails.discountType}
              isCurrentProduct={false}
              composition={alternativeDetails.productContent}
              alternativeProduct={null}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AlternativeProduct
