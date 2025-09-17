"use client"

import type React from "react"

import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation } from "swiper/modules"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import { Link } from "react-router-dom"
import { brandResponsive } from "@/utils/responsive"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/utils/API"
import { BRANDS } from "@/CONFIG/api-routes"
import { useState } from "react"

interface BrandSliderProps {
  title?: string
  description?: string
  showTitle?: boolean
}
type Brand = {
  id: string
  name: string
  logoUrl: string
}

const BrandSlider: React.FC<BrandSliderProps> = ({ title, description, showTitle }) => {
  const [page] = useState(1)
  const [pageSize] = useState(20)

  const getBrands = async () => {
    const response = await axiosInstance.get(BRANDS, {
      params: {
        page,
        pageSize,
      },
    })
    return response.data.data
  }

  const { data } = useQuery({
    queryKey: ["brands"],
    queryFn: () => getBrands(),
  })

  return (
    <div className="m-[12px] my-[20px] sm:m-[20px]">
      {showTitle && <h2 className="text-3xl font-bold">{title}</h2>}
      {showTitle && <p className="text-sm text-muted-foreground w-[95%]">{description}</p>}
      <Swiper
        navigation={true}
        modules={[Navigation]}
        className="mySwiper my-[24px] sm:my-[32px]"
        breakpoints={brandResponsive}
      >
        {data?.data.map((item: Brand, _i: number) => {
          return (
            <SwiperSlide key={item.id}>
              <div className="w-[100%]">
                <Link to={`/search?brand=${encodeURIComponent(item.name)}`} className="flex flex-col items-center">
                  <div className="w-[148px] h-[148px] rounded-full bg-gray-100 flex justify-center items-center overflow-hidden border border-gray-200">
                    <img className={`w-[100%] h-[100%] object-contain`} src={item.logoUrl || "/placeholder.svg"} />
                  </div>
                  <p className="font-semibold mt-2">{item.name}</p>
                </Link>
              </div>
            </SwiperSlide>
          )
        })}
      </Swiper>
    </div>
  )
}

export default BrandSlider
