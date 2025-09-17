"use client"

import ProductCard from "@/components/ProductCard"
import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { FILTERS, SEARCH } from "@/CONFIG/api-routes"
import axiosInstance from "@/utils/API"
import { useQuery } from "@tanstack/react-query"
import Slider from "rc-slider"
import "rc-slider/assets/index.css"

// type Tabs = "brand" | "advanced";

interface FilterState {
  brands: string[]
  categories: string[]
  price: {
    min: number
    max: number
  }
}

interface Product {
  name: string
  images: string[]
  slug: string
  category: {
    name: string
    id: string
  }
  brand: {
    name: string
    id: string
  }
  variants: {
    id: string
    productId: string
    name: string
    price: number
    stock: number
    createdAt: string
    updatedAt: string
    createdBy: string
    updatedBy: string
    units: number
    discount: number
    discountType: string
  }[]
}

// interface SearchProduct {
//     id: number;
//     name: string;
//     slug: string;
//     category: {
//         name: string;
//         id: number;
//     };
//     brand: {
//         name: string;
//         id: number;
//     };
//     price: number;
//     discountedPrice: number;
//     image: string;
// }

interface SearchResponse {
  data: {
    products: Product[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
  message: string
  status: string
}

interface FilterResponse {
  data: {
    brands: Array<{ id: string; name: string }>
    categories: Array<{ id: string; name: string }>
    price: {
      min: number
      max: number
    }
  }
}

function Search() {
  const [searchParams] = useSearchParams()
  const [showSort, setShowSort] = useState<boolean>(false)
  const [showFilter, setShowFilter] = useState<boolean>(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [sort, setSort] = useState("name-asc")

  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    categories: [],
    price: {
      min: 0,
      max: 7000,
    },
  })

  useEffect(() => {
    if (showFilter) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [showFilter])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSort(false)
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilter(false)
      }
    }

    if (showSort || showFilter) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showSort, showFilter])

  const buildSearchRequestBody = () => {
    const brand = searchParams.get("brand")
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const requestBody: any = {
      page,
      limit,
      sort,
      price: {
        min: filters.price.min,
        max: filters.price.max,
      },
    }

    // Add brands array
    const brandsArray = [...filters.brands]
    if (brand) brandsArray.push(brand)
    if (brandsArray.length > 0) {
      requestBody.brands = brandsArray
    }

    // Add categories array
    const categoriesArray = [...filters.categories]
    if (category) categoriesArray.push(category)
    if (categoriesArray.length > 0) {
      requestBody.categories = categoriesArray
    }

    // Add search query if present
    if (search) {
      requestBody.query = search
    }

    return requestBody
  }

  const { data: searchData, isLoading: isLoadingProducts } = useQuery<SearchResponse>({
    queryKey: ["products", searchParams.toString(), page, sort, filters],
    queryFn: async () => {
      const requestBody = buildSearchRequestBody()
      const response = await axiosInstance.post(SEARCH, requestBody)
      return response.data
    },
  })

  // Fetch filters using React Query
  const {
    data: { data: availableFilters } = { brands: [], categories: [], price: { min: 0, max: 7000 } },
  } = useQuery<FilterResponse>({
    queryKey: ["filters"],
    queryFn: async () => {
      const response = await axiosInstance.get(FILTERS)
      return response.data
    },
  })

  useEffect(() => {
    if (availableFilters?.price) {
      setFilters((prev) => ({
        ...prev,
        price: {
          min: availableFilters.price.min,
          max: availableFilters.price.max,
        },
      }))
    }
  }, [availableFilters?.price])

  const handleFilterChange = (filterType: keyof FilterState, value: any) => {
    setFilters((prev) => {
      const newFilters = { ...prev }

      if (Array.isArray(prev[filterType])) {
        const array = prev[filterType] as string[]
        const index = array.indexOf(value)
        if (index === -1) {
          ;(newFilters[filterType] as string[]).push(value)
        } else {
          ;(newFilters[filterType] as string[]).splice(index, 1)
        }
      } else if (filterType === "price") {
        newFilters.price = { ...prev.price, ...value }
      }

      return newFilters
    })
  }

  const handleSortChange = (sortType: string) => {
    setSort(sortType)
    setShowSort(false)
    setPage(1) // Reset page when sort changes
  }

  const applyFilters = () => {
    setPage(1)
    setShowFilter(false)
  }

  const resetFilters = () => {
    setFilters({
      brands: [],
      categories: [],
      price: {
        min: availableFilters?.price?.min || 0,
        max: availableFilters?.price?.max || 7000,
      },
    })
    setPage(1)
  }

  const getLowestPriceVariant = (variants: Product["variants"]) => {
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

  const getSortDisplayText = () => {
    switch (sort) {
      case "name-asc":
        return "Name (A-Z)"
      case "name-desc":
        return "Name (Z-A)"
      case "price-asc":
        return "Price: Low to High"
      case "price-desc":
        return "Price: High to Low"
      default:
        return "Sort"
    }
  }

  return (
    <section className="bg-gray-50 mx-[12px] md:mx-[20px] rounded-md py-8 antialiased dark:bg-gray-900 relative">
      <div className="px-4 md:px-8">
        {/* Search Bar Start */}
        <div className="mb-4 items-end justify-between space-y-4 sm:flex sm:space-y-0 md:mb-8">
          <div>
            <h2 className="mt-3 text-xl font-semibold text-gray-400 dark:text-white sm:text-2xl">
              Search Results for{" "}
              <span className="text-gray-900">
                {searchParams.get("search") || searchParams.get("brand") || searchParams.get("category")}
              </span>
            </h2>
          </div>
          <div className="flex items-center space-x-4 relative">
            <button
              type="button"
              className="flex !w-[100px] items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
              onClick={() => setShowFilter(!showFilter)}
            >
              <svg
                className="-ms-0.5 me-2 h-4 w-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                  d="M18.796 4H5.204a1 1 0 0 0-.753 1.659l5.302 6.058a1 1 0 0 1 .247.659v4.874a.5.5 0 0 0 .2.4l3 2.25a.5.5 0 0 0 .8-.4v-7.124a1 1 0 0 1 .247-.659l5.302-6.059c.566-.646.106-1.658-.753-1.658Z"
                />
              </svg>
              Filters
            </button>

            <div ref={sortRef} className="relative flex-1">
              <button
                type="button"
                className="flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
                onClick={() => setShowSort(!showSort)}
              >
                <svg
                  className="-ms-0.5 me-2 h-4 w-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 4v16M7 4l3 3M7 4 4 7m9-3h6l-6 6h6m-6.5 10 3.5-7 3.5 7M14 18h4"
                  />
                </svg>
                {getSortDisplayText()}
              </button>

              {/* Sort Dropdown - Centered positioning */}
              <div
                className={`absolute left-1/2 transform -translate-x-1/2 top-full mt-2 z-50 ${showSort ? "block" : "hidden"} w-48 divide-y divide-gray-100 rounded-lg bg-white shadow-lg border dark:bg-gray-700`}
              >
                <ul className="p-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  <li>
                    <button
                      onClick={() => handleSortChange("name-asc")}
                      className="group inline-flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      <span>Name (A-Z)</span>
                      {sort === "name-asc" && (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleSortChange("name-desc")}
                      className="group inline-flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      <span>Name (Z-A)</span>
                      {sort === "name-desc" && (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleSortChange("price-asc")}
                      className="group inline-flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      <span>Price: Low to High</span>
                      {sort === "price-asc" && (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleSortChange("price-desc")}
                      className="group inline-flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      <span>Price: High to Low</span>
                      {sort === "price-desc" && (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Filter Modal */}
            {showFilter && (
              <div className="fixed inset-0 z-50">
                <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                  <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500/75 backdrop-blur-sm"></div>
                  </div>
                  <div
                    ref={filterRef}
                    className="relative transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all w-full max-w-lg max-h-[95vh] overflow-y-auto my-[2.5vh] flex flex-col mx-auto"
                  >
                    <div className="bg-white px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
                      <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Filters</h3>
                        <button onClick={() => setShowFilter(false)} className="text-gray-400 hover:text-gray-500">
                          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-3 sm:pb-4">
                      <div className="space-y-4 sm:space-y-6">
                        <div>
                          <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3">Categories</h4>
                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            {availableFilters?.categories.map((category) => {
                              const isSelected =
                                filters.categories.includes(category.id) ||
                                searchParams.get("category") === category.name
                              const isLongText = category.name.length > 15
                              return (
                                <label
                                  key={category.id}
                                  className={`relative flex items-center p-2 sm:p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                                    isSelected ? "bg-blue-50 border-blue-200" : ""
                                  } ${isLongText ? "col-span-2" : ""}`}
                                >
                                  <input
                                    type="checkbox"
                                    className="h-3 w-3 sm:h-4 sm:w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                                    checked={isSelected}
                                    onChange={() => handleFilterChange("categories", category.id)}
                                  />
                                  <span
                                    className={`ml-2 sm:ml-3 text-xs sm:text-sm font-medium ${
                                      isSelected ? "text-blue-900" : "text-gray-900"
                                    }`}
                                  >
                                    {category.name}
                                  </span>
                                </label>
                              )
                            })}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3">Brands</h4>
                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            {availableFilters?.brands.map((brand) => {
                              const isSelected =
                                filters.brands.includes(brand.id) || searchParams.get("brand") === brand.name
                              const isLongText = brand.name.length > 15
                              return (
                                <label
                                  key={brand.id}
                                  className={`relative flex items-center p-2 sm:p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                                    isSelected ? "bg-blue-50 border-blue-200" : ""
                                  } ${isLongText ? "col-span-2" : ""}`}
                                >
                                  <input
                                    type="checkbox"
                                    className="h-3 w-3 sm:h-4 sm:w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                                    checked={isSelected}
                                    onChange={() => handleFilterChange("brands", brand.id)}
                                  />
                                  <span
                                    className={`ml-2 sm:ml-3 text-xs sm:text-sm font-medium ${
                                      isSelected ? "text-blue-900" : "text-gray-900"
                                    }`}
                                  >
                                    {brand.name}
                                  </span>
                                </label>
                              )
                            })}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3">Price Range</h4>
                          <div className="px-2 sm:px-3">
                            <Slider
                              range
                              min={availableFilters?.price?.min || 0}
                              max={availableFilters?.price?.max || 7000}
                              value={[filters.price.min, filters.price.max]}
                              onChange={(value: number | number[]) => {
                                if (Array.isArray(value)) {
                                  handleFilterChange("price", {
                                    min: value[0],
                                    max: value[1],
                                  })
                                }
                              }}
                              className="mb-3 sm:mb-4"
                            />
                            <div className="flex justify-between items-center">
                              <div className="text-xs sm:text-sm font-medium text-gray-900">₹{filters.price.min}</div>
                              <div className="text-xs sm:text-sm font-medium text-gray-900">₹{filters.price.max}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex justify-end gap-2 sm:gap-3 border-t border-gray-200">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={resetFilters}
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={applyFilters}
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-4 grid gap-4 sm:grid-cols-2 md:mb-8 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
          {isLoadingProducts ? (
            <div>Loading...</div>
          ) : (
            searchData?.data.products.map((product) => {
              const lowestPriceVariant = getLowestPriceVariant(product.variants)

              return (
                <ProductCard
                  key={product.slug}
                  name={product.name}
                  category={product.category.name}
                  slug={product.slug}
                  price={lowestPriceVariant.price}
                  discount={lowestPriceVariant.discount}
                  discountType={lowestPriceVariant.discountType}
                  productImagePath={product.images[0]}
                />
              )
            })
          )}
        </div>

        {/* Pagination Controls */}
        {searchData && searchData.data.totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {page} of {searchData.data.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(searchData.data.totalPages, p + 1))}
              disabled={page === searchData.data.totalPages}
              className="px-4 py-2 border rounded"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default Search
