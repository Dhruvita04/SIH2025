"use client"

import { useState, useRef, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/utils/API"
import { SEARCH_BAR } from "@/CONFIG/api-routes"
import { Link } from "react-router-dom"
import { useDebounce } from "@/hooks/useDebounce"

type SearchResult = {
  type: string
  value: string
  image: string
  slug?: string
}

function Search() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const debouncedSearch = useDebounce(searchTerm, 500)
  const searchRef = useRef<HTMLFormElement>(null)

  const searchProducts = async () => {
    if (!debouncedSearch) return { data: [] }
    const response = await axiosInstance.get(SEARCH_BAR, {
      params: {
        search: debouncedSearch,
        limit: 20,
        page: 1,
      },
    })
    return response.data
  }

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", debouncedSearch],
    queryFn: searchProducts,
    enabled: debouncedSearch.length > 0,
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (searchResults?.data?.length > 0 || isLoading) {
      setShowDropdown(true)
    }
  }, [searchResults, isLoading])

  const highlightMatch = (text: string) => {
    if (!searchTerm) return text

    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const parts = text.split(new RegExp(`(${escapedSearchTerm})`, "gi"))
    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={index} className="bg-blue-200">
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  const getSearchRoute = (type: string, value: string, slug: string) => {
    if (type === "product") {
      return `/product/${slug}`
    } else if (type === "brand") {
      return `/search?brand=${value}`
    } else if (type === "category") {
      return `/search?category=${value}`
    } else {
      return `/search?search=${value}`
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "product":
        return "Product"
      case "brand":
        return "Brand"
      case "category":
        return "Category"
      case "searchTerm":
        return "Search"
      default:
        return "Item"
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "product":
        return "text-gray-400"
      case "brand":
        return "text-gray-400"
      case "category":
        return "text-gray-400"
      case "searchTerm":
        return "text-gray-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <form ref={searchRef} className="relative" onSubmit={(e) => e.preventDefault()}>
      <div className="relative z-20 flex gap-x-3 p-3 bg-white border rounded-lg shadow-lg shadow-gray-100">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            className="py-3 px-10 block w-full border-transparent rounded-lg focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
            placeholder="Search for medicines, brands and more..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (searchResults?.data?.length > 0 || isLoading) {
                setShowDropdown(true)
              }
            }}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="w-4 h-4 text-gray-500 hover:text-gray-700"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button className="px-6 py-3 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all">
          Search
        </button>
      </div>

      {showDropdown && (searchResults?.data?.length > 0 || isLoading) && (
        <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : (
            searchResults?.data?.map((search: SearchResult) => (
              <Link
                to={getSearchRoute(search.type, search.value, search?.slug || "")}
                key={search.value}
                className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                onClick={() => setShowDropdown(false)}
              >
                {search.type !== "searchTerm" ? (
                  <>
                    <img
                      src={search.image || "/placeholder.svg"}
                      alt={search.value}
                      className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 leading-tight text-left">
                        {highlightMatch(search.value)}
                      </h4>
                      <span className={`text-xs block mt-1 text-left ${getTypeBadgeColor(search.type)}`}>
                        {getTypeLabel(search.type)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 min-w-0 pl-2">
                    <h4 className="text-sm font-medium text-gray-900 leading-tight text-left">
                      View all results for "{highlightMatch(search.value)}"
                    </h4>
                  </div>
                )}
              </Link>
            ))
          )}
        </div>
      )}
    </form>
  )
}

export default Search
