"use client"

import type React from "react"

import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation } from "swiper/modules"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import { Link } from "react-router-dom"
import { responsive } from "@/utils/responsive"
import axiosInstance from "@/utils/API"
import { CATEGORIES } from "@/CONFIG/api-routes"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

interface SliderProps {
  title: string
  description: string
  showTitle: boolean
}

type Category = {
  id: string
  name: string
  logoUrl: string
}

const Slider: React.FC<SliderProps> = ({ title, description, showTitle }) => {
  const colors: string[] = ["bg-blue-50", "bg-pink-50", "bg-yellow-50", "bg-green-50"]
  const [page] = useState(1)
  const [pageSize] = useState(20)

  const getCategories = async () => {
    const response = await axiosInstance.get(CATEGORIES, {
      params: {
        page,
        pageSize,
      },
    })
    return response.data.data
  }

  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  })

  return (
    <div className="m-[12px] my-[20px] sm:m-[20px]">
      {showTitle && <h2 className="text-3xl font-bold">{title}</h2>}
      {showTitle && <p className="text-sm text-muted-foreground w-[95%]">{description}</p>}
      <Swiper
        navigation={true}
        modules={[Navigation]}
        className="mySwiper my-[24px] sm:my-[32px]"
        breakpoints={responsive}
      >
        {data?.data.map((item: Category, _i: number) => {
          return (
            <SwiperSlide key={item.id}>
              <div className="w-[100%]">
                <Link to={`/search?category=${encodeURIComponent(item.name)}`} className="flex flex-col items-center">
                  <div
                    className={`w-[148px] h-[148px] sm:h-[200px] sm:w-[200px] ${colors[_i % colors.length]} rounded-md flex items-center justify-center`}
                  >
                    <img className="h-[70%] object-fill" src={item.logoUrl || "/placeholder.svg"} />
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

export default Slider
