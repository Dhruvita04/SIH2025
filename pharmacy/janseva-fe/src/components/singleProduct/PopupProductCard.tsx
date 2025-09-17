// import { getPriceBasedOnDiscountType } from "@/utils/helperFunctions"
// import { Card, CardContent } from "../ui/card"
// import type { AlternativeProduct } from "./types"

// interface ProductcardProps {
//   id: string
//   productImagePath: string
//   name: string
//   companyName: string
//   price: number
//   discount: number
//   discountType: string
//   isCurrentProduct: boolean
//   composition: string
//   alternativeProduct: AlternativeProduct | null
// }

// function PopupProductCard({
//   productImagePath,
//   name,
//   companyName,
//   price,
//   discount,
//   discountType,
//   isCurrentProduct,
//   composition,
// //   alternativeProduct,
// }: ProductcardProps) {
//   return (
//     <Card className={`relative overflow-hidden ${isCurrentProduct ? "border-2 border-green-600 shadow-lg" : ""}`}>
//       {isCurrentProduct && (
//         <div className="absolute top-0 right-0 bg-green-600 text-white px-2 py-1 text-xs font-semibold">
//           Generic Alternative
//         </div>
//       )}
//       <CardContent className="p-6">
//         <h3 className="text-xl font-semibold mb-4">{name}</h3>
//         {/* Commented out the saved badge */}
//         {/* {alternativeProduct && (
//           <span className="text-sm text-white bg-green-600 px-2 py-1 rounded-lg mb-2 inline-block">
//             Saved ₹{" "}
//             {Math.abs(
//               Number.parseFloat(
//                 getPriceBasedOnDiscountType(
//                   alternativeProduct.price,
//                   alternativeProduct.discount,
//                   alternativeProduct.discountType,
//                 ),
//               ) - Number.parseFloat(getPriceBasedOnDiscountType(price, discount, discountType)),
//             ).toFixed(2)}
//           </span>
//         )} */}
//         <div className="w-full mb-4 border-2 border-gray-300 rounded-lg">
//           <img src={productImagePath || "/placeholder.svg"} alt={name} className="w-full h-[200px] object-contain" />
//         </div>
//         {/* <p className="text-sm text-muted-foreground mb-4">{companyName}</p> */}
//         <div className="mb-2 pb-2 border-b-[0.3px] border-gray-300">
//           <h4 className="font-semibold mb-2">Marketed By</h4>
//           <p className="text-sm">{companyName}</p>
//         </div>
//         <div className="mb-2 pb-2 border-b-[0.3px] border-gray-300">
//           <h4 className="font-semibold mb-2">Composition</h4>
//           <p className="text-sm">{composition}</p>
//         </div>
//         <div className="mb-2 pb-2 border-b-[0.3px] border-gray-300">
//           <h4 className="font-semibold mb-2">Price</h4>
//           <p className="text-sm">₹ {getPriceBasedOnDiscountType(price, discount, discountType)}</p>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// export default PopupProductCard


import { getPriceBasedOnDiscountType } from "@/utils/helperFunctions"
import { Card, CardContent } from "../ui/card"
import type { AlternativeProduct } from "./types"

interface ProductcardProps {
  id: string
  productImagePath: string
  name: string
  companyName: string
  price: number
  discount: number
  discountType: string
  isCurrentProduct: boolean
  composition: string
  alternativeProduct: AlternativeProduct | null
}

function PopupProductCard({
  productImagePath,
  name,
  companyName,
  price,
  discount,
  discountType,
  isCurrentProduct,
  composition,
}: ProductcardProps) {
  return (
    <Card className={`relative overflow-hidden ${isCurrentProduct ? "border-2 border-green-600 shadow-lg" : ""}`}>
      {isCurrentProduct && (
        <div className="absolute top-0 right-0 bg-green-600 text-white px-2 py-1 text-xs font-semibold">
          Generic Alternative
        </div>
      )}
      <CardContent className={`p-3 md:p-6 ${isCurrentProduct ? "pt-8 md:pt-10" : "pt-8 md:pt-10"}`}>
        <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">{name}</h3>
        <div className="w-full mb-2 md:mb-4 border-2 border-gray-300 rounded-lg">
          <img
            src={productImagePath || "/placeholder.svg"}
            alt={name}
            className="w-full h-[120px] md:h-[200px] object-contain"
          />
        </div>
        <div className="mb-1 md:mb-2 pb-1 md:pb-2 border-b-[0.3px] border-gray-300">
          <h4 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Marketed By</h4>
          <p className="text-xs md:text-sm">{companyName}</p>
        </div>
        <div className="mb-1 md:mb-2 pb-1 md:pb-2 border-b-[0.3px] border-gray-300">
          <h4 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Composition</h4>
          <p className="text-xs md:text-sm">{composition}</p>
        </div>
        <div className="mb-1 md:mb-2 pb-1 md:pb-2 border-b-[0.3px] border-gray-300">
          <h4 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Price</h4>
          <p className="text-xs md:text-sm">₹ {getPriceBasedOnDiscountType(price, discount, discountType)}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default PopupProductCard
