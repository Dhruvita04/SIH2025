"use client"

import { Shield, CheckCircle, Atom, Coins } from 'lucide-react'
import { useState } from "react"
import { Link } from "react-router-dom"
import PopupProductCard from "../singleProduct/PopupProductCard"
import { getPriceBasedOnDiscountType } from "../../utils/helperFunctions"
import { shelcalImagePath, cipcalImagePath } from "../../assets/images"
import { Button } from "../ui/button"
import { Dialog, DialogTitle, DialogHeader, DialogContent, DialogTrigger } from "../ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"

interface SubstitutesSectionProps {
  className?: string
}

export default function SubstitutesSection({ className }: SubstitutesSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showDialogSavings, setShowDialogSavings] = useState(false)

  const shelcalAlternative = {
    id: "shelcal-500-alt",
    productId: "shelcal-500",
    imageUrl: shelcalImagePath,
    productName: "SHELCAL 500",
    companyName: "Torrent Pharmaceuticals Ltd",
    productContent: "Elemental Calcium(500Mg)/ Vitamin D3 (Cholecalciferol) (250 Iu)",
    price: 95.6,
    discount: 20,
    discountType: "percentage",
    units: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const cipcalAlternative = {
    id: "cipcal-500-alt",
    productId: "cipcal-500",
    imageUrl: cipcalImagePath,
    productName: "CIPCAL 500",
    companyName: "Cipla Ltd",
    productContent: "Elemental Calcium(500Mg)/ Vitamin D3 (Cholecalciferol) (250 Iu)",
    price: 58.55,
    discount: 0,
    discountType: "percentage",
    units: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const shelcalProduct = {
    id: "shelcal-500",
    productImagePath: shelcalImagePath,
    name: "SHELCAL 500",
    companyName: "Torrent Pharmaceuticals Ltd",
    price: 95.6,
    discount: 20,
    discountType: "percentage",
    isCurrentProduct: false,
    composition: "Elemental Calcium(500Mg)/ Vitamin D3 (Cholecalciferol) (250 Iu)",
    alternativeProduct: cipcalAlternative,
  }

  const cipcalProduct = {
    id: "cipcal-500",
    productImagePath: cipcalImagePath,
    name: "CIPCAL 500",
    companyName: "Cipla Ltd",
    price: 58.55,
    discount: 0,
    discountType: "percentage",
    isCurrentProduct: true,
    composition: "Elemental Calcium(500Mg)/ Vitamin D3 (Cholecalciferol) (250 Iu)",
    alternativeProduct: shelcalAlternative,
  }

  const calculateSavings = (product1: any, product2: any) => {
    return Math.abs(
      Number.parseFloat(getPriceBasedOnDiscountType(product1.price, product1.discount, product1.discountType)) -
        Number.parseFloat(getPriceBasedOnDiscountType(product2.price, product2.discount, product2.discountType)),
    ).toFixed(2)
  }

  const handleViewExampleClick = () => {
    setDialogOpen(true)
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
    setShowDialogSavings(true)
  }

  return (
    <>
      <section className={`w-full ${className}`}>
        <div className="container mx-auto px-4 py-4 md:py-6">
          {/* Modified gradient to go from white at top-left to blue theme color at bottom-right */}
          <div className="bg-gradient-to-br from-white via-blue-100 to-blue-200 dark:from-slate-800 dark:via-blue-800/20 dark:to-blue-900/30 border border-border/50 rounded-2xl p-3 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/10 via-blue-50/10 to-white/10 animate-pulse pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-white/20 to-transparent pointer-events-none"></div>

            <div className="max-w-md mx-auto text-center md:max-w-6xl relative z-10">
              <div className="md:grid md:grid-cols-2 md:gap-16 md:items-center mb-4 md:mb-6">
                <div className="mb-4 md:mb-0 text-center">
                  <p className="text-foreground/80 text-sm md:text-lg font-medium mb-1 md:mb-2">
                    Now save your money with
                  </p>
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4 leading-tight">
                    Substitutes
                  </h2>

                  <div className="flex justify-center mb-3 md:mb-4">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 via-blue-300/30 to-blue-200/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                      <Shield className="relative w-20 h-20 md:w-32 md:h-32 text-blue-700 fill-blue-100/50 drop-shadow-lg" />
                      <div className="absolute inset-0 flex items-center justify-center p-1">
                        <span className="text-blue-700 font-bold text-3xl md:text-6xl drop-shadow-sm">₹</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-foreground font-semibold text-lg md:text-2xl mb-3 md:mb-4 leading-relaxed">
                    Substitutes are the smarter choice
                  </p>
                </div>

                <div>
                  <div className="space-y-2 md:space-y-4">
                    <div className="flex items-start gap-2 md:gap-3 text-left p-1 md:p-2 rounded-xl hover:bg-blue-50/50 transition-colors duration-200">
                      <div className="bg-blue-100/70 p-1 rounded-lg">
                        <CheckCircle className="w-8 h-8 md:w-8 md:h-8 text-blue-700 flex-shrink-0" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-base md:text-xl mb-0 md:mb-1">Safe</h3>
                        <p className="text-muted-foreground text-sm md:text-lg">FDA and GMP certified medicine</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 md:gap-3 text-left p-1 md:p-2 rounded-xl hover:bg-blue-50/50 transition-colors duration-200">
                      <div className="bg-blue-100/70 p-1 rounded-lg">
                        <Atom className="w-8 h-8 md:w-8 md:h-8 text-blue-700 flex-shrink-0" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-base md:text-xl mb-0 md:mb-1">Same</h3>
                        <p className="text-muted-foreground text-sm md:text-lg">Exact same salt composition</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 md:gap-3 text-left p-1 md:p-2 rounded-xl hover:bg-blue-50/50 transition-colors duration-200">
                      <div className="bg-blue-100/70 p-1 rounded-lg">
                        <Coins className="w-8 h-8 md:w-8 md:h-8 text-blue-700 flex-shrink-0" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-base md:text-xl mb-0 md:mb-1">Saving</h3>
                        <p className="text-muted-foreground text-sm md:text-lg">Up to 51% cheaper medicines</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/30 pt-4 md:pt-6 space-y-4 md:space-y-5">
                <div className="relative p-3 md:p-4 bg-gradient-to-r from-blue-50/80 via-blue-100/80 to-blue-50/80 rounded-xl border border-blue-200/60 shadow-lg max-w-2xl mx-auto backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-blue-100/30 to-blue-50/30 rounded-xl"></div>
                  <div className="relative flex items-center justify-center gap-2 md:gap-3">
                    <div className="bg-blue-100/70 p-1 md:p-2 rounded-full hidden md:block">
                      <Shield className="w-4 h-4 md:w-5 md:h-5 text-blue-700" />
                    </div>
                    <p className="text-sm md:text-lg text-foreground font-medium text-center">
                      All generics are made by top <span className="text-blue-700 font-bold">1%</span> medicine
                      manufacturers
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:justify-center md:items-center gap-3 md:gap-8 max-w-2xl mx-auto">
                  <Link
                    to="/substitutes"
                    className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors w-full md:w-auto font-semibold text-center text-sm md:text-base"
                  >
                    Learn More
                  </Link>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={handleViewExampleClick}
                        className="px-3 py-2 border border-blue-700 text-blue-700 bg-transparent rounded-md hover:bg-blue-50 transition-colors w-full md:w-auto font-medium text-xs md:text-base leading-tight"
                      >
                        View Example
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px]">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-center mb-4">
                          Substitutes are the smarter choice
                        </DialogTitle>
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
                              You can save ₹{calculateSavings(shelcalProduct, cipcalProduct)} with the alternative!
                            </motion.p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="grid grid-cols-2 gap-6">
                        <PopupProductCard {...shelcalProduct} />
                        <PopupProductCard {...cipcalProduct} />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
