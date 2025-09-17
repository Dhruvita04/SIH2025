import type React from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation } from "swiper/modules"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import { productHalfResponsive, productResponsive } from "@/utils/responsive"
import ProductCard from "../ProductCard"
import type { Product } from "@/models/product"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/utils/API"
import { PRODUCTS_TAGS } from "@/CONFIG/api-routes"

interface ProductSliderProps {
  title: string
  description: string
  showTitle: boolean
  halfSlider?: boolean
  tags: string[]
}

interface ProductVariant {
  price: number
  discount: number
  discountType: string
}

const TagsProductSlider: React.FC<ProductSliderProps> = ({
  title,
  description,
  showTitle,
  tags,
  halfSlider = false,
}) => {
  const getTagsProducts = async () => {
    const response = await axiosInstance.get(`${PRODUCTS_TAGS}?tags=${tags.join(",")}&page=1&limit=15`)
    return response.data.data
  }

  const { data: productList } = useQuery({
    queryKey: ["products-tags", tags],
    queryFn: () => getTagsProducts(),
  })

  const getLowestPriceVariant = (variants: ProductVariant[]) => {
    if (!variants || variants.length === 0) {
      return { price: 0, discount: 0, discountType: "percentage" }
    }

    let lowestVariant = variants[0]
    let lowestFinalPrice = variants[0].price

    if (variants[0].discountType === "percentage") {
      lowestFinalPrice = variants[0].price * (1 - variants[0].discount / 100)
    } else {
      lowestFinalPrice = variants[0].price - variants[0].discount
    }

    for (let i = 1; i < variants.length; i++) {
      const variant = variants[i]
      let finalPrice = variant.price

      if (variant.discountType === "percentage") {
        finalPrice = variant.price * (1 - variant.discount / 100)
      } else {
        finalPrice = variant.price - variant.discount
      }

      if (finalPrice < lowestFinalPrice) {
        lowestFinalPrice = finalPrice
        lowestVariant = variant
      }
    }

    return lowestVariant
  }

  return (
    <div className="m-[12px] my-[20px] sm:m-[20px]">
      {showTitle && <h2 className="text-3xl font-bold">{title}</h2>}
      {showTitle && <p className="text-sm text-muted-foreground w-[95%]">{description}</p>}
      <Swiper
        navigation={true}
        modules={[Navigation]}
        className="mySwiper my-[24px] sm:my-[32px]"
        breakpoints={halfSlider ? productHalfResponsive : productResponsive}
      >
        {productList &&
          productList?.data.map((item: Product, _i: number) => {
            const lowestPriceVariant = getLowestPriceVariant(item.productVariationsList)

            return (
              <SwiperSlide key={_i}>
                <div className="w-[100%]">
                  <ProductCard
                    key={_i}
                    slug={item.slug}
                    productImagePath={item.imageUrl}
                    name={item.name}
                    category={item.category}
                    price={lowestPriceVariant.price}
                    discount={lowestPriceVariant.discount}
                    discountType={lowestPriceVariant.discountType}
                  />
                </div>
              </SwiperSlide>
            )
          })}
      </Swiper>
    </div>
  )
}

export default TagsProductSlider
