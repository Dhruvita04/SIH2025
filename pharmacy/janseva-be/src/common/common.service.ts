import { Injectable } from "@nestjs/common"
import { BrandService } from "src/brand/brand.service"
import { CategoryService } from "src/category/category.service"
import { PrismaService } from "src/prisma/prisma.service"
import { ProductService } from "src/product/product.service"
import * as fs from "fs"
import * as path from "path"

type SearchResult = {
  type: string
  value: string
  image: string
  slug?: string
}

interface SearchRequest {
  query?: string
  brands?: string[]
  categories?: string[]
  price?: {
    min: number
    max: number
  }
  sort?: string
  page?: number
  limit?: number
}

@Injectable()
export class CommonService {
  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private prismaService: PrismaService,
  ) {}

  private async getPlaceholderImageBase64(): Promise<string> {
    try {
      const placeholderPath = path.join(process.cwd(), "public", "placeholder.png")
      const imageBuffer = fs.readFileSync(placeholderPath)
      const base64String = imageBuffer.toString("base64")
      return `data:image/png;base64,${base64String}`
    } catch (error) {
      // Fallback to URL if file reading fails
      return "/placeholder.png"
    }
  }

  async getSearchBarResults(page: number, limit: number, search: string) {
    try {
      const searchResults = []

      // 1. search term
      const searchResult: SearchResult = {
        type: "searchTerm",
        value: search,
        image: "", // Empty string for search term
      }
      searchResults.push(searchResult)

      // 2. search category
      const categories = await this.getCategoriesBySearchTerm(search)
      const categoryResults: SearchResult[] = categories.map((category) => ({
        type: "category",
        value: category.name,
        image: category.logoUrl,
      }))
      searchResults.push(...categoryResults)

      // 3. search brand
      const brands = await this.getBrandsBySearchTerm(search)
      const brandResults: SearchResult[] = brands.map((brand) => ({
        type: "brand",
        value: brand.name,
        image: brand.logoUrl,
      }))
      searchResults.push(...brandResults)

      // 4. search product
      const products = await this.getProductsBySearchTerm(search)
      const placeholderBase64 = await this.getPlaceholderImageBase64()
      const productResults: SearchResult[] = products.map((product) => ({
        type: "product",
        value: product.name,
        image: product.images?.[0] || placeholderBase64,
        slug: product.slug,
      }))
      searchResults.push(...productResults)

      return searchResults
    } catch (error) {
      throw new Error("Error in getting search bar results")
    }
  }

  async getProductsBySearchTerm(search: string) {
    // implement fuzzy search for products
    const products = await this.prismaService.product.findMany({
      where: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      select: {
        name: true,
        images: true,
        slug: true,
      },
    })
    return products
  }

  async getCategoriesBySearchTerm(search: string) {
    // implement fuzzy search for categories
    const categories = await this.prismaService.category.findMany({
      where: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      select: {
        name: true,
        logoUrl: true,
      },
    })
    return categories
  }

  async getBrandsBySearchTerm(search: string) {
    // implement fuzzy search for brands
    const brands = await this.prismaService.brand.findMany({
      where: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      select: {
        name: true,
        logoUrl: true,
      },
    })
    return brands
  }

  async getSearchPageResults(searchRequest: SearchRequest) {
    try {
      const { query = "", brands = [], categories = [], price, sort = "name-asc", page = 1, limit = 10 } = searchRequest

      // Build where clause
      const where: any = {}

      // Add query search
      if (query) {
        where.OR = [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            brand: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
          {
            category: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        ]
      }

      if (brands && brands.length > 0) {
        where.brand = {
          name: {
            in: brands,
            mode: "insensitive",
          },
        }
      }

      if (categories && categories.length > 0) {
        where.category = {
          name: {
            in: categories,
            mode: "insensitive",
          },
        }
      }

      // Add price filter
      if (price) {
        where.variants = {
          some: {
            price: {
              gte: price.min,
              lte: price.max,
            },
          },
        }
      }

      const searchResults = await this.prismaService.product.findMany({
        where,
        orderBy: this.isPriceSorting(sort) ? undefined : this.buildOrderBy(sort),
        include: {
          category: {
            select: {
              name: true,
              id: true,
            },
          },
          brand: {
            select: {
              name: true,
              id: true,
            },
          },
          variants: true,
        },
      })

      let sortedResults = searchResults
      if (this.isPriceSorting(sort)) {
        sortedResults = this.sortByPrice(searchResults, sort)
      }

      const startIndex = (page - 1) * Number.parseInt(limit.toString())
      const endIndex = startIndex + Number.parseInt(limit.toString())
      const paginatedResults = sortedResults.slice(startIndex, endIndex)

      // Get total count
      const total = await this.prismaService.product.count({
        where: where,
      })

      const placeholderBase64 = await this.getPlaceholderImageBase64()

      const processedProducts = paginatedResults.map((product) => {
        // If product has no images or empty images array, use base64 placeholder
        if (!product.images || product.images.length === 0) {
          return {
            ...product,
            images: [placeholderBase64], // Return array with base64 placeholder instead of empty array
            imageUrl: placeholderBase64,
            isPlaceholder: true,
          }
        } else {
          return {
            ...product,
            imageUrl: product.images[0],
            isPlaceholder: false,
          }
        }
      })

      return {
        products: processedProducts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / Number.parseInt(limit.toString())),
      }
    } catch (error) {
      throw new Error(`Failed to get search results: ${error.message}`)
    }
  }

  private isPriceSorting(sort: string): boolean {
    return sort === "price-asc" || sort === "price-desc"
  }

  private sortByPrice(products: any[], sort: string): any[] {
    return products.sort((a, b) => {
      const lowestPriceA = this.getLowestVariantPrice(a.variants)
      const lowestPriceB = this.getLowestVariantPrice(b.variants)

      if (sort === "price-asc") {
        return lowestPriceA - lowestPriceB
      } else {
        return lowestPriceB - lowestPriceA
      }
    })
  }

  private getLowestVariantPrice(variants: any[]): number {
    if (!variants || variants.length === 0) {
      return Number.MAX_VALUE // Return high value if no variants
    }

    return variants.reduce((lowest, variant) => {
      // Calculate discounted price - assuming discount is a percentage
      const originalPrice = variant.price || 0
      const discount = variant.discount || 0

      // Calculate discounted price - assuming discount is a percentage
      const discountedPrice =
        discount > 0
          ? originalPrice * (1 - discount / 100) // Percentage discount
          : originalPrice // No discount

      return Math.min(lowest, discountedPrice)
    }, Number.MAX_VALUE)
  }

  private buildOrderBy(sort: string) {
    switch (sort) {
      case "name-asc":
        return { name: "asc" as const }
      case "name-desc":
        return { name: "desc" as const }
      case "price-asc":
      case "price-desc":
        return { name: "asc" as const }
      case "newest":
        return { createdAt: "desc" as const }
      case "oldest":
        return { createdAt: "asc" as const }
      default:
        return { name: "asc" as const }
    }
  }

  async getFilters() {
    try {
      // get all categories,brands
      const categories = await this.prismaService.category.findMany({
        select: {
          name: true,
          id: true,
        },
      })
      const brands = await this.prismaService.brand.findMany({
        select: {
          name: true,
          id: true,
        },
      })

      // Get all products with variants to calculate price range
      const products = await this.prismaService.product.findMany({
        include: {
          variants: true,
        },
      })

      let minPrice = Number.MAX_VALUE
      let maxPrice = 0

      products.forEach((product) => {
        if (product.variants && product.variants.length > 0) {
          product.variants.forEach((variant) => {
            const originalPrice = variant.price || 0
            const discount = variant.discount || 0
            const discountedPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice

            if (discountedPrice < minPrice) {
              minPrice = discountedPrice
            }
            if (discountedPrice > maxPrice) {
              maxPrice = discountedPrice
            }
          })
        }
      })

      // If no products found, set default values
      if (minPrice === Number.MAX_VALUE) {
        minPrice = 0
      }

      return {
        categories,
        brands,
        price: {
          min: Math.floor(minPrice),
          max: Math.ceil(maxPrice),
        },
      }
    } catch (error) {
      throw new Error("Error in getting filters")
    }
  }
}
