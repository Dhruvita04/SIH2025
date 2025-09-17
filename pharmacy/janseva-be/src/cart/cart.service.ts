import { PrismaService } from "src/prisma/prisma.service"
import { AddToCartDto } from "./dto/add-to-cart.dto"
import { SyncCartDto } from "./dto/sync-cart.dto"
import { Injectable } from "@nestjs/common"
import { DeleteCartItemDto } from "./dto/delete-cart-item.dto"
import { UpdateCartItemDto } from "./dto/update-cart.dto"
import * as fs from "fs"
import * as path from "path"

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

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

  private calculateDiscountedPrice(price: number, discountType: string, discountValue: number): number {
    if (!discountType || !discountValue || discountValue <= 0) {
      return price
    }

    switch (discountType.toLowerCase()) {
      case "percentage":
        return price - (price * discountValue) / 100
      case "fixed":
        return Math.max(0, price - discountValue)
      default:
        return price
    }
  }

  async addToCart(data: AddToCartDto) {
    try {
      // Validate input data
      if (!data.userId || !data.productId || !data.variantId || !data.quantity) {
        throw new Error("Missing required fields: userId, productId, variantId, or quantity")
      }

      if (data.quantity <= 0) {
        throw new Error("Quantity must be greater than 0")
      }

      // Check if product and variant exist
      const productVariant = await this.prisma.productVariant.findUnique({
        where: {
          id: data.variantId,
        },
        include: {
          product: true,
        },
      })

      if (!productVariant) {
        throw new Error("Product variant not found")
      }

      if (productVariant.productId !== data.productId) {
        throw new Error("Product variant does not belong to the specified product")
      }

      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: {
          id: data.userId,
        },
      })

      if (!user) {
        throw new Error("User not found")
      }

      // Get or create cart for user
      let cart = await this.prisma.cart.findUnique({
        where: {
          userId: data.userId,
        },
      })

      if (!cart) {
        cart = await this.prisma.cart.create({
          data: {
            userId: data.userId,
          },
        })
      }

      // If cart has prescriptionOrderId, remove it when user manually adds items
      if (cart.prescriptionOrderId) {
        cart = await this.prisma.cart.update({
          where: {
            id: cart.id,
          },
          data: {
            prescriptionOrderId: null,
            isPrescriptionCart: false,
          },
        })
      }

      // Check if item already exists in cart
      const existingCartItem = await this.prisma.cartProduct.findUnique({
        where: {
          cartId_productId_variantId: {
            cartId: cart.id,
            productId: data.productId,
            variantId: data.variantId,
          },
        },
      })

      if (existingCartItem) {
        // Update quantity if item already exists (ADD to existing quantity)
        const updatedItem = await this.prisma.cartProduct.update({
          where: {
            cartId_productId_variantId: {
              cartId: cart.id,
              productId: data.productId,
              variantId: data.variantId,
            },
          },
          data: {
            quantity: existingCartItem.quantity + data.quantity,
          },
        })

        return {
          status: "success",
          message: "Product quantity updated in cart successfully",
          data: {
            cartId: cart.id,
            productId: data.productId,
            variantId: data.variantId,
            quantity: updatedItem.quantity,
          },
        }
      } else {
        // Add new product to cart
        const cartProduct = await this.prisma.cartProduct.create({
          data: {
            cartId: cart.id,
            productId: data.productId,
            variantId: data.variantId,
            quantity: data.quantity,
          },
        })

        return {
          status: "success",
          message: "Product added to cart successfully",
          data: {
            cartId: cart.id,
            productId: data.productId,
            variantId: data.variantId,
            quantity: cartProduct.quantity,
          },
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      throw new Error(`Failed to add product to cart: ${error.message}`)
    }
  }

  async updateCartItem(data: UpdateCartItemDto) {
    try {
      // Validate input data
      if (!data.userId || !data.productId || !data.variantId || data.quantity === undefined) {
        throw new Error("Missing required fields: userId, productId, variantId, or quantity")
      }

      if (data.quantity < 0) {
        throw new Error("Quantity cannot be negative")
      }

      // Get or create cart for user
      let cart = await this.prisma.cart.findUnique({
        where: {
          userId: data.userId,
        },
      })

      if (!cart) {
        cart = await this.prisma.cart.create({
          data: {
            userId: data.userId,
          },
        })
      }

      // If cart has prescriptionOrderId, remove it when user manually updates items
      if (cart.prescriptionOrderId) {
        cart = await this.prisma.cart.update({
          where: {
            id: cart.id,
          },
          data: {
            prescriptionOrderId: null,
            isPrescriptionCart: false,
          },
        })
      }

      if (data.quantity === 0) {
        // Remove item if quantity is 0
        await this.prisma.cartProduct.deleteMany({
          where: {
            cartId: cart.id,
            productId: data.productId,
            variantId: data.variantId,
          },
        })

        return {
          status: "success",
          message: "Cart item removed successfully",
          data: null,
        }
      }

      // upsert cart item to handle both update and create scenarios
      const cartProduct = await this.prisma.cartProduct.upsert({
        where: {
          cartId_productId_variantId: {
            cartId: cart.id,
            productId: data.productId,
            variantId: data.variantId,
          },
        },
        update: {
          quantity: data.quantity,
        },
        create: {
          cartId: cart.id,
          productId: data.productId,
          variantId: data.variantId,
          quantity: data.quantity,
        },
      })

      return {
        status: "success",
        message: "Cart item updated successfully",
        data: {
          cartId: cart.id,
          productId: data.productId,
          variantId: data.variantId,
          quantity: cartProduct.quantity,
        },
      }
    } catch (error) {
      console.error("Error updating cart item:", error)
      throw new Error(`Failed to update cart item: ${error.message}`)
    }
  }

  async syncCart(data: SyncCartDto) {
    try {
      // Validate input data
      if (!data.userId || !Array.isArray(data.data)) {
        throw new Error("Missing required fields: userId or data array")
      }

      // Get or create cart for user
      let cart = await this.prisma.cart.findUnique({
        where: {
          userId: data.userId,
        },
        include: {
          products: {
            include: {
              product: {
                include: {
                  brand: true,
                },
              },
              variant: true,
            },
          },
        },
      })

      if (!cart) {
        cart = await this.prisma.cart.create({
          data: {
            userId: data.userId,
            prescriptionId: data.prescriptionId || null,
          },
          include: {
            products: {
              include: {
                product: {
                  include: {
                    brand: true,
                  },
                },
                variant: true,
              },
            },
          },
        })
      }

      const placeholderBase64 = await this.getPlaceholderImageBase64()

      // If cart has prescriptionOrderId, return current cart data without any sync operations
      if (cart.prescriptionOrderId) {
        const detailedProducts = cart.products.map((cartProduct) => {
          const originalPrice = cartProduct.variant.price
          const discountedPrice = this.calculateDiscountedPrice(
            originalPrice,
            cartProduct.variant.discountType,
            cartProduct.variant.discount,
          )

          const hasNoImages = !cartProduct.product.images || cartProduct.product.images.length === 0
          const imageUrl = hasNoImages ? placeholderBase64 : cartProduct.product.images[0]

          return {
            productId: cartProduct.productId,
            variantId: cartProduct.variantId,
            name: cartProduct.product.name,
            brand: cartProduct.product.brand?.name || null,
            image: imageUrl,
            isPlaceholder: hasNoImages,
            variant: {
              id: cartProduct.variant.id,
              name: cartProduct.variant.name,
              units: cartProduct.variant.units,
            },
            pricing: {
              originalPrice: originalPrice,
              discountedPrice: discountedPrice,
            },
            quantity: cartProduct.quantity,
          }
        })

        return {
          status: "success",
          message: "Cart has prescription order, sync skipped",
          data: {
            cartId: cart.id,
            itemsCount: cart.products.length,
            hasPrescriptionOrder: true,
            prescriptionId: cart.prescriptionId,
            prescriptionOrderId: cart.prescriptionOrderId,
            products: detailedProducts,
          },
        }
      }

      // Update prescriptionId if provided and no prescriptionOrderId
      if (data.prescriptionId !== undefined && data.prescriptionId !== cart.prescriptionId) {
        cart = await this.prisma.cart.update({
          where: {
            id: cart.id,
          },
          data: {
            prescriptionId: data.prescriptionId,
          },
          include: {
            products: {
              include: {
                product: {
                  include: {
                    brand: true,
                  },
                },
                variant: true,
              },
            },
          },
        })
      }

      // Process payload items - de-duplicate and aggregate by productId + variantId
      const payloadItemsMap = new Map<string, { productId: string; variantId: string; quantity: number }>()

      for (const item of data.data) {
        if (!item.productId || !item.variantId || item.quantity === undefined || item.quantity < 0) {
          continue // Skip invalid items
        }

        // Key is combination of productId and variantId to handle same product with different variants
        const key = `${item.productId}|${item.variantId}`

        if (payloadItemsMap.has(key)) {
          // If duplicate in payload, add quantities
          const existingItem = payloadItemsMap.get(key)
          existingItem.quantity += item.quantity
        } else {
          payloadItemsMap.set(key, {
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })
        }
      }

      // Validate that all variants exist and belong to correct products
      const variantIds = Array.from(payloadItemsMap.values()).map((item) => item.variantId)
      const existingVariants = await this.prisma.productVariant.findMany({
        where: {
          id: { in: variantIds },
        },
        include: {
          product: {
            include: {
              brand: true,
            },
          },
        },
      })

      const validVariants = new Map<string, any>() // variantId -> variant with product data
      existingVariants.forEach((variant) => {
        validVariants.set(variant.id, variant)
      })

      // Filter payload items to only include valid variants with matching productIds
      const validPayloadItems = new Map<string, { productId: string; variantId: string; quantity: number }>()

      for (const [key, item] of payloadItemsMap) {
        const variant = validVariants.get(item.variantId)
        if (variant && variant.productId === item.productId) {
          validPayloadItems.set(key, item)
        }
      }

      // Use payload as the source of truth
      // The payload represents the current state of the user's cart on the frontend
      const finalItemsMap = new Map<string, { productId: string; variantId: string; quantity: number }>()

      // Add all valid payload items to final map
      for (const [key, payloadItem] of validPayloadItems) {
        if (payloadItem.quantity > 0) {
          // Only add items with positive quantity
          finalItemsMap.set(key, {
            productId: payloadItem.productId,
            variantId: payloadItem.variantId,
            quantity: payloadItem.quantity,
          })
        }
        // Items with quantity 0 are effectively removed (not added to final map)
      }

      // Update database with final items using transaction
      await this.prisma.$transaction(async (tx) => {
        // Delete all existing cart items first
        await tx.cartProduct.deleteMany({
          where: {
            cartId: cart.id,
          },
        })

        // Add all items from final map
        if (finalItemsMap.size > 0) {
          const cartProductsToCreate = Array.from(finalItemsMap.values()).map((item) => ({
            cartId: cart.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          }))

          await tx.cartProduct.createMany({
            data: cartProductsToCreate,
          })
        }
      })

      // Fetch updated cart from database with all details
      const updatedCart = await this.prisma.cart.findUnique({
        where: {
          id: cart.id,
        },
        include: {
          products: {
            include: {
              product: {
                include: {
                  brand: true,
                },
              },
              variant: true,
            },
          },
        },
      })

      // Format response data from database only
      const detailedProducts = updatedCart.products.map((cartProduct) => {
        const originalPrice = cartProduct.variant.price
        const discountedPrice = this.calculateDiscountedPrice(
          originalPrice,
          cartProduct.variant.discountType,
          cartProduct.variant.discount,
        )

        const hasNoImages = !cartProduct.product.images || cartProduct.product.images.length === 0
        const imageUrl = hasNoImages ? placeholderBase64 : cartProduct.product.images[0]

        return {
          productId: cartProduct.productId,
          variantId: cartProduct.variantId,
          name: cartProduct.product.name,
          brand: cartProduct.product.brand?.name || null,
          image: imageUrl,
          isPlaceholder: hasNoImages,
          variant: {
            id: cartProduct.variant.id,
            name: cartProduct.variant.name,
            units: cartProduct.variant.units,
          },
          pricing: {
            originalPrice: originalPrice,
            discountedPrice: discountedPrice,
          },
          quantity: cartProduct.quantity,
        }
      })

      return {
        status: "success",
        message: "Cart synced successfully",
        data: {
          cartId: updatedCart.id,
          itemsCount: updatedCart.products.length,
          prescriptionId: updatedCart.prescriptionId,
          prescriptionOrderId: updatedCart.prescriptionOrderId,
          products: detailedProducts,
        },
      }
    } catch (error) {
      console.error("Error syncing cart:", error)
      throw new Error(`Failed to sync cart: ${error.message}`)
    }
  }

  async deleteCartItem(data: DeleteCartItemDto) {
    try {
      // Validate input data
      if (!data.userId || !data.productId || !data.variantId) {
        throw new Error("Missing required fields: userId, productId, or variantId")
      }

      // Get cart for user
      const cart = await this.prisma.cart.findUnique({
        where: {
          userId: data.userId,
        },
      })

      if (!cart) {
        throw new Error("Cart not found")
      }

      // If cart has prescriptionOrderId, remove it when user manually deletes items
      if (cart.prescriptionOrderId) {
        await this.prisma.cart.update({
          where: {
            id: cart.id,
          },
          data: {
            prescriptionOrderId: null,
            isPrescriptionCart: false,
          },
        })
      }

      const result = await this.prisma.cartProduct.deleteMany({
        where: {
          cartId: cart.id,
          productId: data.productId,
          variantId: data.variantId,
        },
      })

      return {
        status: "success",
        message: "Cart item deleted successfully",
        data: {
          deletedCount: result.count,
        },
      }
    } catch (error) {
      console.error("Error deleting cart item:", error)
      throw new Error(`Failed to delete cart item: ${error.message}`)
    }
  }

  async changePrescription(userId: string, prescriptionId: string | null) {
    try {
      // Validate input data
      if (!userId) {
        throw new Error("Missing required field: userId")
      }

      // Get cart for user
      const cart = await this.prisma.cart.findUnique({
        where: {
          userId: userId,
        },
        include: {
          products: {
            include: {
              product: {
                include: {
                  brand: true,
                },
              },
              variant: true,
            },
          },
        },
      })

      if (!cart) {
        throw new Error("Cart not found")
      }

      // If prescriptionId is provided, validate that the prescription exists
      if (prescriptionId) {
        const prescription = await this.prisma.prescription.findUnique({
          where: {
            id: prescriptionId,
          },
        })

        if (!prescription) {
          throw new Error("Prescription not found")
        }

        // Check if prescription belongs to the user
        if (prescription.userId !== userId) {
          throw new Error("Prescription does not belong to the user")
        }
      }

      // Update cart with new prescription and remove prescription order link
      const updatedCart = await this.prisma.cart.update({
        where: {
          id: cart.id,
        },
        data: {
          prescriptionId: prescriptionId, // This will be null when removing prescription
          prescriptionOrderId: null, // Always clear prescription order when changing prescription
          isPrescriptionCart: false, // Reset prescription cart flag
        },
        include: {
          products: {
            include: {
              product: {
                include: {
                  brand: true,
                },
              },
              variant: true,
            },
          },
        },
      })

      const placeholderBase64 = await this.getPlaceholderImageBase64()

      // Format detailed product information
      const detailedProducts = updatedCart.products.map((cartProduct) => {
        const originalPrice = cartProduct.variant.price
        const discountedPrice = this.calculateDiscountedPrice(
          originalPrice,
          cartProduct.variant.discountType,
          cartProduct.variant.discount,
        )

        const hasNoImages = !cartProduct.product.images || cartProduct.product.images.length === 0
        const imageUrl = hasNoImages ? placeholderBase64 : cartProduct.product.images[0]

        return {
          productId: cartProduct.productId,
          variantId: cartProduct.variantId,
          name: cartProduct.product.name,
          brand: cartProduct.product.brand?.name || null,
          image: imageUrl,
          isPlaceholder: hasNoImages,
          variant: {
            id: cartProduct.variant.id,
            name: cartProduct.variant.name,
            units: cartProduct.variant.units,
          },
          pricing: {
            originalPrice: originalPrice,
            discountedPrice: discountedPrice,
          },
          quantity: cartProduct.quantity,
        }
      })

      const successMessage = prescriptionId
        ? "Cart prescription updated successfully"
        : "Prescription removed from cart successfully"

      return {
        status: "success",
        message: successMessage,
        data: {
          cartId: updatedCart.id,
          itemsCount: updatedCart.products.length,
          prescriptionId: updatedCart.prescriptionId,
          prescriptionOrderId: updatedCart.prescriptionOrderId,
          isPrescriptionCart: updatedCart.isPrescriptionCart,
          products: detailedProducts,
        },
      }
    } catch (error) {
      console.error("Error changing prescription:", error)
      throw new Error(`Failed to change prescription: ${error.message}`)
    }
  }

  async getCartData(data: { productId: string; quantity: number; variantId: string }[]) {
    try {
      // Validate input data
      if (!Array.isArray(data)) {
        throw new Error("Missing required field: data array")
      }

      // Process payload items - de-duplicate and aggregate by productId + variantId
      const payloadItemsMap = new Map<string, { productId: string; variantId: string; quantity: number }>()

      for (const item of data) {
        if (!item.productId || !item.variantId || item.quantity === undefined || item.quantity < 0) {
          continue // Skip invalid items
        }

        // Key is combination of productId and variantId to handle same product with different variants
        const key = `${item.productId}|${item.variantId}`

        if (payloadItemsMap.has(key)) {
          // If duplicate in payload, add quantities
          const existingItem = payloadItemsMap.get(key)
          existingItem.quantity += item.quantity
        } else {
          payloadItemsMap.set(key, {
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })
        }
      }

      // Validate that all variants exist and belong to correct products
      const variantIds = Array.from(payloadItemsMap.values()).map((item) => item.variantId)

      if (variantIds.length === 0) {
        return {
          status: "success",
          message: "Cart data retrieved successfully",
          data: {
            cartId: null,
            itemsCount: 0,
            prescriptionId: null,
            prescriptionOrderId: null,
            products: [],
          },
        }
      }

      const existingVariants = await this.prisma.productVariant.findMany({
        where: {
          id: { in: variantIds },
        },
        include: {
          product: {
            include: {
              brand: true,
            },
          },
        },
      })

      const validVariants = new Map<string, any>() // variantId -> variant with product data
      existingVariants.forEach((variant) => {
        validVariants.set(variant.id, variant)
      })

      const placeholderBase64 = await this.getPlaceholderImageBase64()

      // Filter payload items to only include valid variants with matching productIds
      const validProducts = []

      for (const [key, item] of payloadItemsMap) {
        const variant = validVariants.get(item.variantId)
        if (variant && variant.productId === item.productId && item.quantity > 0) {
          const originalPrice = variant.price
          const discountedPrice = this.calculateDiscountedPrice(originalPrice, variant.discountType, variant.discount)

          const hasNoImages = !variant.product.images || variant.product.images.length === 0
          const imageUrl = hasNoImages ? placeholderBase64 : variant.product.images[0]

          validProducts.push({
            productId: item.productId,
            variantId: item.variantId,
            name: variant.product.name,
            brand: variant.product.brand?.name || null,
            image: imageUrl,
            isPlaceholder: hasNoImages,
            variant: {
              id: variant.id,
              name: variant.name,
              units: variant.units,
            },
            pricing: {
              originalPrice: originalPrice,
              discountedPrice: discountedPrice,
            },
            quantity: item.quantity,
          })
        }
      }

      return {
        status: "success",
        message: "Cart data retrieved successfully",
        data: {
          cartId: null,
          itemsCount: validProducts.length,
          prescriptionId: null,
          prescriptionOrderId: null,
          products: validProducts,
        },
      }
    } catch (error) {
      console.error("Error getting cart data:", error)
      throw new Error(`Failed to get cart data: ${error.message}`)
    }
  }
}
