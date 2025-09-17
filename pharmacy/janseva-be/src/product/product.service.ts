import { ConflictException, Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { ImageService } from "../utils/image.service"
import { CreateProductDto } from "./dto/create-product.dto"
import { Prisma } from "@prisma/client"
import { scrape, type ScrapeResult } from "src/utils/scraper"
import * as fs from "fs"
import * as path from "path"

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private imageService: ImageService,
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

  base64ToBuffer(base64String: string): Buffer {
    // Remove data URL prefix if it exists
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "")

    try {
      return Buffer.from(base64Data, "base64")
    } catch (error) {
      throw new Error("Invalid base64 string")
    }
  }

  async createProduct(data: CreateProductDto, currentObjectName: string) {
    try {
      // Check if a product with the same name already exists
      const existingProductByName = await this.prisma.product.findFirst({
        where: { name: data.productName },
      })

      if (existingProductByName) {
        throw new ConflictException(`A ${currentObjectName} with this name already exists`)
      }

      // Check if a product with the same slug already exists
      const existingProductBySlug = await this.prisma.product.findFirst({
        where: { slug: data.productSlug },
      })

      if (existingProductBySlug) {
        throw new ConflictException(`A ${currentObjectName} with this slug already exists`)
      }

      const imageUrls: string[] = []

      if (data.productImages && data.productImages.length > 0) {
        try {
          for (let i = 0; i < data.productImages.length; i++) {
            if (!this.isValidBase64(data.productImages[i])) {
              throw new Error("Invalid base64 string")
            }
            const buffer = this.base64ToBuffer(data.productImages[i])
            const imageUrl = await this.imageService.uploadImage(
              "products",
              `${this.formatProductName(data.productName)}_${i + 1}.${this.getExtensionFromBase64(data.productImages[i])}`,
              this.getMimeTypeFromBase64(data.productImages[i]),
              buffer,
            )
            imageUrls.push(imageUrl)
          }
        } catch (error) {
          throw new Error(`Error uploading product images: ${error.message}`)
        }
      }

      // create the product
      const product = await this.prisma.product.create({
        data: {
          name: data.productName,
          slug: data.productSlug,
          description: data.productDescription,
          images: imageUrls, // This will be empty array if no images provided
          categoryId: data.categoryId,
          brandId: data.brandId,
          uses: data.uses,
          direction: data.productDirections,
          routeOfAdministration: data.productRouteOfAdministration,
          sideEffects: data.productSideEffects,
          medActivity: data.productMedActivity,
          precaution: data.productPrecaution,
          interactions: data.productInteractions,
          dosageInformation: data.productDosageInformation,
          storage: data.productStorage,
          dietAndLifestyleGuidance: data.productDietAndLifestyleGuidance,
          highlights: data.productHighlights,
          ingredients: data.productIngredients,
          keyUses: data.productKeyUses,
          howToUse: data.productHowToUse,
          safetyInformation: data.productSafetyInformation,
          additionalInfo: data.productAdditionalInfo,
          composition: data.productComposition,
          hsnCode: data.productHsnCode,
          tags: data.tags || [],
          createdBy: "system",
          updatedBy: "system",
        },
      })

      // get product Id and create variants
      const productId = product.id

      try {
        await this.createProductVariants(data, productId)
      } catch (error) {
        // Clean up the created product if variant creation fails
        await this.prisma.product.delete({ where: { id: productId } })
        throw new Error(`Error creating product variants: ${error.message}`)
      }

      // Handle alternative product if exists
      if (data.hasAlternativeProduct) {
        try {
          const alternativeBuffer = this.base64ToBuffer(data.productAlternativeImage)
          const productAlternativeImageUrl = await this.imageService.uploadImage(
            "products",
            `${this.formatProductName(data.productAlternatives.productAlternativeName)}.${this.getExtensionFromBase64(data.productAlternativeImage)}`,
            this.getMimeTypeFromBase64(data.productAlternativeImage),
            alternativeBuffer,
          )
          await this.createProductAlternative(data, productAlternativeImageUrl, productId)
        } catch (error) {
          // Clean up the created product if alternative creation fails
          await this.prisma.product.delete({ where: { id: productId } })
          throw new Error(`Error creating product alternative: ${error.message}`)
        }
      }

      // Return the complete product with variants and alternatives
      return product
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error
      }
      throw new Error(`Failed to create product: ${error.message}`)
    }
  }

  isValidBase64(str: string): boolean {
    // First check if it's a data URL
    if (str.startsWith("data:")) {
      const matches = str.match(/^data:image\/(\w+);base64,(.+)$/)
      if (!matches) return false
      str = matches[2] // Get just the base64 part
    }

    try {
      return btoa(atob(str)) === str
    } catch (err) {
      return false
    }
  }

  formatProductName(name: string) {
    return name.toLowerCase().replace(/ /g, "_")
  }

  getMimeTypeFromBase64(base64: string) {
    return base64 == "" || base64 == " " ? " " : base64.split(";")[0].split(":")[1]
  }

  getExtensionFromBase64(base64: string) {
    return base64 == "" || base64 == " " ? " " : base64.split(";")[0].split("/")[1]
  }

  async createProductAlternative(data: CreateProductDto, productAlternativeImageUrl: string, productId: string) {
    const productAlternativeData: Prisma.ProductAlternativeCreateInput = {
      productId: productId,
      productName: data.productAlternatives.productAlternativeName,
      companyName: data.productAlternatives.productAlternativeCompanyName,
      productContent: data.productAlternatives.productAlternativeContent,
      price: data.productAlternatives.productAlternativePrice,
      discount: data.productAlternatives.productAlternativeDiscount,
      discountType: data.productAlternatives.productAlternativeDiscountType,
      units: data.productAlternatives.productAlternativeUnits,
      imageUrl: productAlternativeImageUrl,
    }

    return this.prisma.productAlternative.create({
      data: productAlternativeData,
    })
  }

  async createProductVariants(dto: CreateProductDto, productId: string) {
    for (let index = 0; index < dto.productVariations.length; index++) {
      const variant = dto.productVariations[index]

      const productVariantData: Prisma.ProductVariantCreateInput = {
        product: { connect: { id: productId } },
        name: variant.name,
        price: variant.price,
        discount: variant.discount,
        discountType: variant.discountType,
        units: variant.units,
        stock: variant.stock,
        createdBy: "system",
        updatedBy: "system",
      }

      await this.prisma.productVariant.create({
        data: productVariantData,
      })
    }
  }

  async getAllProducts(page?: number, limit?: number, search?: string) {
    try {
      // Set default values if not provided
      const defaultPage = page || 1
      const defaultLimit = limit || 10

      // Validate inputs
      if (defaultPage < 1 || defaultLimit < 1) {
        throw new Error("Page and limit must be greater than 0")
      }

      // Ensure limit is an integer
      const parsedLimit = Number(defaultLimit)
      if (isNaN(parsedLimit)) {
        throw new Error("Limit must be a valid number")
      }

      // Build where clause for fuzzy search
      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { slug: { contains: search, mode: "insensitive" } },
              {
                brand: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
              {
                category: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
            ],
          }
        : {}

      const productCount = await this.prisma.product.count({ where: where as Prisma.ProductWhereInput })

      const products = await this.prisma.product.findMany({
        where: where as Prisma.ProductWhereInput,
        skip: (defaultPage - 1) * parsedLimit,
        take: parsedLimit,
        orderBy: {
          createdAt: "desc",
        },
      })

      if (products.length === 0) throw new NotFoundException("No products found")

      const placeholderBase64 = await this.getPlaceholderImageBase64()

      const updatedData = await Promise.all(
        products.map(async (product) => {
          const brand = await this.getBrandName(product.brandId)
          const category = await this.getCategoryName(product.categoryId)
          const variationsCount = await this.getProductVariationsCount(product.id)
          const variations = await this.getProductVariations(product.id)
          const alternative = await this.getProductAlternative(product.id)

          const hasNoImages = !product.images || product.images.length === 0
          const imageUrl = hasNoImages ? placeholderBase64 : product.images[0]
          const isPlaceholder = hasNoImages

          return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            imageUrl,
            isPlaceholder,
            brand,
            category,
            productVariationsList: variations,
            productVariations: variationsCount,
            hasAlternative: alternative !== null ? "Yes" : "No",
            createdBy: product.createdBy,
            updatedBy: product.updatedBy,
          }
        }),
      )

      return {
        data: updatedData,
        total: productCount,
      }
    } catch (error) {
      throw new Error(`Error in getting all products: ${error.message}`)
    }
  }

  async getBrandName(brandId: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id: brandId } })
    if (!brand) throw new Error("Brand not found")
    return brand.name
  }

  async getCategoryName(categoryId: string) {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } })
    if (!category) throw new Error("Category not found")
    return category.name
  }

  async getProductVariationsCount(productId: string) {
    const variations = await this.prisma.productVariant.count({ where: { productId } })
    return variations
  }

  async getProductAlternative(productId: string) {
    const alternative = await this.prisma.productAlternative.findFirst({ where: { productId } })
    return alternative
  }

  async getProductVariations(productId: string) {
    const variations = await this.prisma.productVariant.findMany({
      where: {
        productId,
        // Exclude archived variants from normal queries
        name: { not: { startsWith: "[ARCHIVED]" } },
      },
    })
    return variations
  }

  async deleteProduct(id: string) {
    // 1. Get all variant IDs for the product
    const variants = await this.prisma.productVariant.findMany({
      where: { productId: id },
      select: { id: true },
    })

    const variantIds = variants.map((v) => v.id)

    // 2. Get all orderProduct IDs (for shippedBatch deletion)
    const orderProducts = await this.prisma.orderProduct.findMany({
      where: { variantId: { in: variantIds } },
      select: { id: true },
    })

    const orderProductIds = orderProducts.map((o) => o.id)

    // 3. Delete shippedBatches (dependent on orderProduct)
    if (orderProductIds.length > 0) {
      await this.prisma.shippedBatch.deleteMany({
        where: { orderProductId: { in: orderProductIds } },
      })
    }

    // 4. Delete cartProduct entries
    if (variantIds.length > 0) {
      await this.prisma.cartProduct.deleteMany({
        where: { variantId: { in: variantIds } },
      })

      await this.prisma.orderProduct.deleteMany({
        where: { variantId: { in: variantIds } },
      })
    }

    // 5. Delete alternative image (if exists)
    const alternativeImage = await this.prisma.productAlternative.findFirst({
      where: { productId: id },
      select: { imageUrl: true },
    })

    if (alternativeImage) {
      await this.imageService.deleteImage("products", alternativeImage.imageUrl)
    }

    await this.prisma.productAlternative.deleteMany({ where: { productId: id } })

    // 6. Delete product variant images (if any)
    const product = await this.prisma.product.findFirst({
      where: { id },
      select: { images: true },
    })

    if (product?.images?.length) {
      for (const image of product.images) {
        await this.imageService.deleteImage("products", image)
      }
    }

    // 7. Delete productVariants
    await this.prisma.productVariant.deleteMany({
      where: { productId: id },
    })

    // 8. Delete the main product
    const deleted = await this.prisma.product.delete({
      where: { id },
    })

    return deleted
  }

  async getProductBySlug(slug: string) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { slug },
        include: {
          brand: true,
          category: true,
        },
      })
      if (!product) throw new NotFoundException(`Product not found`)

      // get the alternative details
      const alternative = await this.getProductAlternative(product.id)

      // get all the variations and sort by price ascending
      const variations = await this.getProductVariations(product.id)
      const sortedVariations = variations.sort((a, b) => a.price - b.price)

      let productImages = product.images && product.images.length > 0 ? product.images : []
      let isPlaceholder = false

      if (productImages.length === 0) {
        const placeholderBase64 = await this.getPlaceholderImageBase64()
        productImages = [placeholderBase64]
        isPlaceholder = true
      }

      return {
        productDetails: {
          ...product,
          images: productImages,
          isPlaceholder,
          brand: product.brand.name,
          category: product.category.name,
        },
        alternativeDetails: alternative,
        variationsDetails: sortedVariations,
      }
    } catch (error) {
      throw new NotFoundException(`Error in getting product details`)
    }
  }

  async updateProduct(slug: string, data: CreateProductDto, currentObjectName: string) {
    const product = await this.prisma.product.findUnique({ where: { slug } })
    if (!product) throw new NotFoundException(`Product not found`)

    // Check if another product with the same name exists (excluding current product)
    const existingProductByName = await this.prisma.product.findFirst({
      where: {
        name: data.productName,
        id: { not: product.id },
      },
    })

    if (existingProductByName) {
      throw new ConflictException(`A ${currentObjectName} with this name already exists`)
    }

    // Check if another product with the same slug exists (excluding current product)
    const existingProductBySlug = await this.prisma.product.findFirst({
      where: {
        slug: data.productSlug,
        id: { not: product.id },
      },
    })

    if (existingProductBySlug) {
      throw new ConflictException(`A ${currentObjectName} with this slug already exists`)
    }

    // Check if the alternative exists
    const alternative = await this.getProductAlternative(product.id)

    // Update the image if the alternative exists
    if (alternative) {
      // Delete the old image
      await this.imageService.deleteImage("products", alternative.imageUrl)

      // Upload the new image
      const alternativeBuffer = this.base64ToBuffer(data.productAlternativeImage)
      const productAlternativeImageUrl = await this.imageService.uploadImage(
        "products",
        `${this.formatProductName(data.productAlternatives.productAlternativeName)}.${this.getExtensionFromBase64(data.productAlternativeImage)}`,
        this.getMimeTypeFromBase64(data.productAlternativeImage),
        alternativeBuffer,
      )

      // Update the alternative details
      await this.prisma.productAlternative.update({
        where: { productId: product.id },
        data: {
          imageUrl: productAlternativeImageUrl,
          productName: data.productAlternatives.productAlternativeName,
          companyName: data.productAlternatives.productAlternativeCompanyName,
          productContent: data.productAlternatives.productAlternativeContent,
          price: data.productAlternatives.productAlternativePrice,
          discount: data.productAlternatives.productAlternativeDiscount,
          discountType: data.productAlternatives.productAlternativeDiscountType,
          units: data.productAlternatives.productAlternativeUnits,
        },
      })
    }

    const existingVariants = await this.prisma.productVariant.findMany({
      where: { productId: product.id },
    })

    await this.prisma.$transaction(async (tx) => {
      // Remove cart products to avoid foreign key constraints
      const variantIds = existingVariants.map((variant) => variant.id)
      if (variantIds.length > 0) {
        await tx.cartProduct.deleteMany({
          where: { variantId: { in: variantIds } },
        })
      }

      // Create maps for efficient lookup using IDs
      const existingVariantsById = new Map(existingVariants.map((v) => [v.id, v]))
      const incomingVariantIds = new Set(
        data.productVariations
          .filter((v) => v.id) // Only include variants with IDs (existing variants)
          .map((v) => v.id),
      )

      // Process incoming variants (update existing or create new)
      for (const variation of data.productVariations) {
        if (variation.id && existingVariantsById.has(variation.id)) {
          // Update existing variant
          await tx.productVariant.update({
            where: { id: variation.id },
            data: {
              name: variation.name,
              price: variation.price,
              discount: variation.discount,
              discountType: variation.discountType,
              stock: variation.stock,
              units: variation.units,
              updatedBy: "system",
            },
          })
        } else {
          // Create new variant (no ID provided)
          await tx.productVariant.create({
            data: {
              productId: product.id,
              name: variation.name,
              price: variation.price,
              discount: variation.discount,
              discountType: variation.discountType,
              stock: variation.stock,
              units: variation.units,
              createdBy: "system",
              updatedBy: "system",
            },
          })
        }
      }

      // Delete variants that are not in the incoming request
      const variantsToDelete = existingVariants.filter((variant) => !incomingVariantIds.has(variant.id))

      for (const variant of variantsToDelete) {
        // Delete order products first to avoid foreign key constraints
        await tx.orderProduct.deleteMany({
          where: { variantId: variant.id },
        })

        // Delete the variant
        await tx.productVariant.delete({
          where: { id: variant.id },
        })
      }
    })

    let newImageUrls: string[] = []

    if (data.productImages !== undefined) {
      if (data.productImages.length > 0) {
        // Delete all existing product images
        for (const imageUrl of product.images) {
          await this.imageService.deleteImage("products", imageUrl)
        }

        // Upload new images
        for (let i = 0; i < data.productImages.length; i++) {
          const buffer = this.base64ToBuffer(data.productImages[i])
          const imageUrl = await this.imageService.uploadImage(
            "products",
            `${this.formatProductName(data.productName)}_${i + 1}.${this.getExtensionFromBase64(data.productImages[i])}`,
            this.getMimeTypeFromBase64(data.productImages[i]),
            buffer,
          )
          newImageUrls.push(imageUrl)
        }
      } else {
        // If productImages is provided but empty, clear all images
        for (const imageUrl of product.images) {
          await this.imageService.deleteImage("products", imageUrl)
        }
        newImageUrls = []
      }
    } else {
      for (const imageUrl of product.images) {
        await this.imageService.deleteImage("products", imageUrl)
      }
      newImageUrls = []
    }

    // Update product details
    const updatedProduct = await this.prisma.product.update({
      where: { id: product.id },
      data: {
        name: data.productName,
        slug: data.productSlug,
        description: data.productDescription,
        images: newImageUrls,
        categoryId: data.categoryId,
        brandId: data.brandId,
        uses: data.uses,
        direction: data.productDirections,
        routeOfAdministration: data.productRouteOfAdministration,
        sideEffects: data.productSideEffects,
        medActivity: data.productMedActivity,
        precaution: data.productPrecaution,
        interactions: data.productInteractions,
        dosageInformation: data.productDosageInformation,
        storage: data.productStorage,
        dietAndLifestyleGuidance: data.productDietAndLifestyleGuidance,
        highlights: data.productHighlights,
        ingredients: data.productIngredients,
        keyUses: data.productKeyUses,
        howToUse: data.productHowToUse,
        safetyInformation: data.productSafetyInformation,
        additionalInfo: data.productAdditionalInfo,
        composition: data.productComposition,
        hsnCode: data.productHsnCode,
        tags: data.tags || [],
        updatedBy: "system",
      },
    })

    return updatedProduct
  }

  async deleteMultipleProducts(ids: string[], currentObjectName: string) {
    // First get all brands that will be deleted
    const products = await this.prisma.product.findMany({
      where: { id: { in: ids } },
    })

    if (products.length === 0) throw new NotFoundException(`${currentObjectName}s not found`)

    // Delete the images first
    for (const product of products) {
      await this.deleteProduct(product.id)
    }

    return { message: "Products deleted successfully" }
  }

  getImageName(name: string) {
    return name.toLowerCase().replace(/ /g, "_")
  }

  async scrapeDetails(medicineName: string): Promise<ScrapeResult> {
    const result = await scrape(medicineName)
    return result
  }

  async getTagsProducts(page?: number, limit?: number, tags?: string) {
    try {
      // Set default values if not provided
      const defaultPage = page || 1
      const defaultLimit = limit || 10

      // Validate inputs
      if (defaultPage < 1 || defaultLimit < 1) {
        throw new Error("Page and limit must be greater than 0")
      }

      // Ensure limit is an integer
      const parsedLimit = Number(defaultLimit)
      if (isNaN(parsedLimit)) {
        throw new Error("Limit must be a valid number")
      }

      // Build where clause for fuzzy search

      const productCount = await this.prisma.product.count({ where: { tags: { has: tags } } })

      const products = await this.prisma.product.findMany({
        where: { tags: { has: tags } },
        skip: (defaultPage - 1) * parsedLimit,
        take: parsedLimit,
        orderBy: {
          createdAt: "desc",
        },
      })

      if (products.length === 0) throw new NotFoundException("No products found")

      const placeholderBase64 = await this.getPlaceholderImageBase64()

      const updatedData = await Promise.all(
        products.map(async (product) => {
          const brand = await this.getBrandName(product.brandId)
          const category = await this.getCategoryName(product.categoryId)
          const variationsCount = await this.getProductVariationsCount(product.id)
          const variations = await this.getProductVariations(product.id)
          const alternative = await this.getProductAlternative(product.id)

          const hasNoImages = !product.images || product.images.length === 0
          const imageUrl = hasNoImages ? placeholderBase64 : product.images[0]
          const isPlaceholder = hasNoImages

          return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            imageUrl,
            isPlaceholder,
            brand,
            category,
            productVariationsList: variations,
            productVariations: variationsCount,
            hasAlternative: alternative !== null ? "Yes" : "No",
            createdBy: product.createdBy,
            updatedBy: product.updatedBy,
          }
        }),
      )

      return {
        data: updatedData,
        total: productCount,
      }
    } catch (error) {
      throw new Error(`Error in getting tags products: ${error.message}`)
    }
  }

  async getTagsSuggestions(search?: string, limit?: number) {
    try {
      // Get all products with tags
      const products = await this.prisma.product.findMany({
        select: {
          tags: true,
        },
        where: {
          tags: {
            isEmpty: false,
          },
        },
      })

      // Extract all unique tags
      const allTags = new Set<string>()
      products.forEach((product) => {
        product.tags.forEach((tag) => {
          allTags.add(tag)
        })
      })

      let uniqueTags = Array.from(allTags)

      // Filter by search if provided
      if (search) {
        uniqueTags = uniqueTags.filter((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      }

      // Sort alphabetically
      uniqueTags.sort()

      // Apply limit if provided
      if (limit && limit > 0) {
        uniqueTags = uniqueTags.slice(0, limit)
      }

      return uniqueTags
    } catch (error) {
      throw new Error(`Error in getting tags suggestions: ${error.message}`)
    }
  }
}
