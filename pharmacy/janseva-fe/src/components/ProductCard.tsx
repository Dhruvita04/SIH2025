import type React from "react"
// import { Product } from "@/models/product";
import { getPriceBasedOnDiscountType } from "@/utils/helperFunctions"
import { PlusIcon } from "@heroicons/react/24/outline"
import { Link } from "react-router-dom"

interface ProductCardProps {
  productImagePath: string
  name: string
  slug?: string
  category: string
  companyName?: string
  price: number
  discountedPrice?: number
  discount?: number
  discountType?: string
  showAddToCart?: boolean
  // <CHANGE> Added prop to control discount badge visibility
  showDiscountBadge?: boolean
}

const ProductCard: React.FC<ProductCardProps> = ({
  productImagePath,
  name,
  slug,
  companyName,
  price,
  discount,
  discountType,
  showAddToCart = true,
  // <CHANGE> Added showDiscountBadge prop with default value true
  showDiscountBadge = true,
}) => {
  return (
    <Link
      to={slug ? `/product/${slug}` : "#"}
      className="block w-[100%] h-[396px] md:h-[412px] bg-[#f2f6fb] rounded-2xl p-[6px] relative"
    >
      {/* <CHANGE> Added condition to check both discount and showDiscountBadge prop */}
      {discount !== 0 && showDiscountBadge && (
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
          {discountType === "percentage"
            ? `${Number(discount).toFixed(0)}% OFF`
            : `₹${Number(discount).toFixed(0)} OFF`}
        </div>
      )}

      <div className="w-[100%] h-[calc(65%-8px)] mb-[8px] bg-[#f2f6fb] rounded-[inherit] flex justify-center items-center">
        <img src={productImagePath || "/placeholder.svg"} className="h-[100%] object-cover rounded-[inherit]" />
      </div>
      <div className="w-[100%] h-[35%] bg-white rounded-2xl p-3">
        <p className="text-xs font-medium text-gray-700">By {companyName}</p>
        <h2 className="text-[1.25rem] font-bold">{name}</h2>

        <div
          className={`w-[100%] flex items-center mt-[24px] md:mt-[12px] ${showAddToCart ? "justify-between" : "justify-end"}`}
        >
          {showAddToCart && (
            <div className="flex gap-1 items-center py-1 px-2 hover:bg-gray-100 text-primary border-2 border-primary rounded-full hover:bg-primary hover:text-white hover:cursor-pointer">
              <PlusIcon height={16} width={16} />
              <p className="text-[0.75rem] font-medium">Add to Cart</p>
            </div>
          )}
          <div className="flex gap-[2px] items-center">
            {discount !== 0 && (
              <p className="text-[0.75rem] text-gray-600 line-through">₹ {price.toLocaleString("en-IN")}</p>
            )}
            <p className="text-[1.25rem] font-bold">
              ₹ {getPriceBasedOnDiscountType(price, discount || 0, discountType || "")}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
