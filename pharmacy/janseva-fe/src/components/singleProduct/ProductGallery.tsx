"use client"

import { Swiper, type SwiperClass, SwiperSlide } from "swiper/react"
import { FreeMode, Navigation, Thumbs, Zoom } from "swiper/modules"
import { useState } from "react"
import ImageMagnifier from "./ImageMagnifier"

import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/navigation"
import "swiper/css/thumbs"
import "swiper/css/zoom"
import "./singleProduct.css"
import useSingleProductFacade from "@/facades/useSingleProductFacade"

function ProductGallery() {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null)
  const { productDetails } = useSingleProductFacade()
  const productImages = productDetails?.images || []

  const hasEnoughImagesForLoop = productImages.length > 1
  const hasEnoughImagesForThumbLoop = productImages.length >= 4

  return (
    <div className="w-full h-[50vh] md:h-[60vh] xl:h-[50vh] flex flex-col gap-2">
      {/* Main Product Image Slider */}
      <Swiper
        loop={hasEnoughImagesForLoop}
        spaceBetween={10}
        navigation={true}
        thumbs={{ swiper: thumbsSwiper }}
        modules={[FreeMode, Navigation, Thumbs, Zoom]}
        className="h-[75%] md:h-[70%] w-full rounded-2xl mainSwipper mb-4 border border-gray-200"
        zoom={{
          maxRatio: 4,
          minRatio: 1,
          toggle: true,
        }}
      >
        {productImages.map((productImage, index) => (
          <SwiperSlide
            key={`main-slide-${index}`}
            className="overflow-hidden rounded-2xl bg-white h-auto max-h-[100%] relative"
          >
            <div className="swiper-zoom-container w-full h-full flex items-center justify-center">
              <ImageMagnifier
                src={productImage || "/placeholder.svg"}
                alt={`Product image ${index + 1}`}
                className="max-h-full max-w-full object-contain rounded-2xl transition-transform duration-300"
                width={800}
                height={600}
                magnifierHeight={160}
                magnifierWidth={160}
                zoomLevel={4}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbnail Slider */}
      <Swiper
        onSwiper={setThumbsSwiper}
        loop={hasEnoughImagesForThumbLoop}
        spaceBetween={10}
        slidesPerView={4}
        freeMode={true}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
        className="h-[25%] md:h-[30%] w-full thumbSwiper pb-2"
      >
        {productImages.map((productImage, index) => (
          <SwiperSlide
            key={`thumb-slide-${index}`}
            className="cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-200 border border-gray-300"
          >
            <img
              src={productImage || "/placeholder.svg"}
              alt={`Thumbnail image ${index + 1}`}
              className="w-full h-full object-contain rounded-lg"
              loading="lazy"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default ProductGallery
