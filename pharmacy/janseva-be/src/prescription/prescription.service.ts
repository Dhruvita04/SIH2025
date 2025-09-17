import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { ImageService } from "../utils/image.service"
import { CreatePrescriptionDto } from "./dto/create-prescription.dto"
import { Multer } from "multer"
import { PrescriptionOrderStatus } from "@prisma/client"
import { CreatePrescriptionOrderDto } from "./dto/create-prescription-order.dto"
import { AddPrescriptionOrderToCartDto } from "./dto/order-to-cart.dto"
import { UpdatePrescriptionOrderStatusDto } from "./dto/update-prescription-order-status.dto"

@Injectable()
export class PrescriptionService {
  constructor(
    private prisma: PrismaService,
    private imageService: ImageService,
  ) {}

  async createPrescription(dto: CreatePrescriptionDto, file: Multer.File, currentObjectName: string) {
    // count of prescriptions for the user
    const count = await this.prisma.prescription.count({
      where: { userId: dto.userId },
    })

    const prescriptionUrl = await this.imageService.uploadImage(
      "prescriptions",
      `${this.getImageName(dto.userId)}_${count + 1}`,
      file.mimetype.toString(),
      file.buffer,
    )

    // create an prescription
    const prescription = await this.prisma.prescription.create({
      data: {
        userId: dto.userId,
        patientName: dto.patientName,
        patientAge: Number.parseInt(dto.patientAge.toString()),
        patientGender: dto.patientGender,
        prescriptionUrl,
        patientWeight: dto.patientWeight || null,
        patientHeight: dto.patientHeight || null,
        patientBloodGroup: dto.patientBloodGroup || null,
        doctorName: dto.doctorName || null,
      },
    })

    if (!prescription) throw new NotFoundException(`${currentObjectName} not created`)

    return prescription
  }

  async getAllPrescriptions(page = 1, limit = 10, search?: string, status?: string) {
    const skip = (page - 1) * limit

    // Build where clause for filtering prescription orders
    const whereClause: any = {}

    // If status is provided, filter by prescription order status
    if (status && status !== "ALL") {
      whereClause.status = status as any
    }

    // Add search functionality for prescription orders
    if (search && search.trim() !== "") {
      const searchTerm = search.trim()

      // First get prescription IDs that match the search criteria
      const matchingPrescriptions = await this.prisma.prescription.findMany({
        where: {
          OR: [
            { patientName: { contains: searchTerm, mode: "insensitive" } },
            { patientGender: { contains: searchTerm, mode: "insensitive" } },
            { patientBloodGroup: { contains: searchTerm, mode: "insensitive" } },
            { doctorName: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        select: { id: true },
      })

      const matchingUsers = await this.prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { email: { contains: searchTerm, mode: "insensitive" } },
            { phone: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        select: { id: true },
      })

      const prescriptionIds = matchingPrescriptions.map((p) => p.id)
      const userIds = matchingUsers.map((u) => u.id)

      whereClause.OR = []

      if (prescriptionIds.length > 0) {
        whereClause.OR.push({ prescriptionId: { in: prescriptionIds } })
      }

      if (userIds.length > 0) {
        whereClause.OR.push({ userId: { in: userIds } })
      }

      // If search term is a number, also search by patient age
      const searchAsNumber = Number.parseInt(searchTerm, 10)
      if (!isNaN(searchAsNumber)) {
        const ageMatchingPrescriptions = await this.prisma.prescription.findMany({
          where: { patientAge: searchAsNumber },
          select: { id: true },
        })
        const ageMatchingIds = ageMatchingPrescriptions.map((p) => p.id)
        if (ageMatchingIds.length > 0) {
          whereClause.OR.push({ prescriptionId: { in: ageMatchingIds } })
        }
      }

      // If no matches found, return empty result
      if (whereClause.OR.length === 0) {
        return {
          data: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        }
      }
    }

    // Get total count of prescription orders
    const totalCount = await this.prisma.prescriptionOrder.count({
      where: whereClause,
    })

    // Get prescription orders
    const prescriptionOrders = await this.prisma.prescriptionOrder.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    })

    // Get prescription and user details for each order
    const prescriptionsWithStatus = await Promise.all(
      prescriptionOrders.map(async (prescriptionOrder) => {
        const prescription = await this.prisma.prescription.findUnique({
          where: { id: prescriptionOrder.prescriptionId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        })

        return {
          id: prescriptionOrder.id, // Use prescription order ID as main ID
          prescriptionId: prescription.id, // Keep prescription ID as separate field
          userId: prescription.userId,
          patientName: prescription.patientName,
          patientAge: prescription.patientAge,
          patientGender: prescription.patientGender,
          patientWeight: prescription.patientWeight,
          patientHeight: prescription.patientHeight,
          patientBloodGroup: prescription.patientBloodGroup,
          doctorName: prescription.doctorName,
          prescriptionUrl: prescription.prescriptionUrl,
          createdAt: prescription.createdAt.toISOString(),
          updatedAt: prescription.updatedAt.toISOString(),
          status: prescriptionOrder.status,
          orderCreatedAt: prescriptionOrder.createdAt.toISOString(),
          rejectionReason: prescriptionOrder.rejectionReason,
          user: prescription.user,
        }
      }),
    )

    return {
      data: prescriptionsWithStatus,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    }
  }

  async getPrescriptionByUserId(userId: string, currentObjectName: string, page = 1, limit = 10, orderOnly = false) {
    const skip = (page - 1) * limit

    if (orderOnly) {
      // Get all prescription orders for this user
      const prescriptionOrders = await this.prisma.prescriptionOrder.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      })

      if (prescriptionOrders.length === 0) {
        return {
          data: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        }
      }

      // Get total count of prescription orders for pagination
      const totalCount = await this.prisma.prescriptionOrder.count({
        where: { userId },
      })

      const prescriptionsWithImagesAndStatus = await Promise.all(
        prescriptionOrders.map(async (prescriptionOrder) => {
          const prescription = await this.prisma.prescription.findUnique({
            where: { id: prescriptionOrder.prescriptionId },
          })

          let signedUrl = null
          let hasError = false
          let errorMessage = null

          if (prescription.prescriptionUrl) {
            try {
              signedUrl = await this.imageService.getSignedUrl("prescriptions", prescription.prescriptionUrl, 240)
            } catch (error) {
              hasError = true
              if (error.status === 503) {
                errorMessage = "Storage service temporarily unavailable. Please try again later."
              } else if (error.status === 410) {
                errorMessage = "Image link expired. Please refresh the page."
              } else {
                errorMessage = "Unable to load prescription image. Please try again."
              }
              signedUrl = null
            }
          }

          return {
            ...prescription,
            createdAt: prescription.createdAt.toISOString(),
            updatedAt: prescription.updatedAt.toISOString(),
            prescription: prescription.prescriptionUrl
              ? {
                  url: signedUrl,
                  path: this.imageService.getImagePathFromUrl(prescription.prescriptionUrl),
                  hasError,
                  errorMessage,
                }
              : null,
            status: prescriptionOrder.status,
            orderId: prescriptionOrder.id,
            orderCreatedAt: prescriptionOrder.createdAt.toISOString(),
            rejectionReason: prescriptionOrder.rejectionReason,
          }
        }),
      )

      return {
        data: prescriptionsWithImagesAndStatus,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      }
    }

    // Original logic for when orderOnly is false
    const whereClause: any = { userId }

    const totalCount = await this.prisma.prescription.count({
      where: whereClause,
    })

    const prescriptions = await this.prisma.prescription.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    })

    if (!prescriptions) throw new NotFoundException(`${currentObjectName} not found`)

    const prescriptionsWithImagesAndStatus = await Promise.all(
      prescriptions.map(async (prescription) => {
        let signedUrl = null
        let hasError = false
        let errorMessage = null

        if (prescription.prescriptionUrl) {
          try {
            signedUrl = await this.imageService.getSignedUrl("prescriptions", prescription.prescriptionUrl, 240)
          } catch (error) {
            hasError = true
            if (error.status === 503) {
              errorMessage = "Storage service temporarily unavailable. Please try again later."
            } else if (error.status === 410) {
              errorMessage = "Image link expired. Please refresh the page."
            } else {
              errorMessage = "Unable to load prescription image. Please try again."
            }
            signedUrl = null
          }
        }

        const prescriptionOrder = await this.prisma.prescriptionOrder.findFirst({
          where: { prescriptionId: prescription.id },
          orderBy: { createdAt: "desc" },
        })

        return {
          ...prescription,
          createdAt: prescription.createdAt.toISOString(),
          updatedAt: prescription.updatedAt.toISOString(),
          prescription: prescription.prescriptionUrl
            ? {
                url: signedUrl,
                path: this.imageService.getImagePathFromUrl(prescription.prescriptionUrl),
                hasError,
                errorMessage,
              }
            : null,
          status: prescriptionOrder?.status || PrescriptionOrderStatus.UPLOADED,
        }
      }),
    )

    return {
      data: prescriptionsWithImagesAndStatus,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    }
  }

  async getPrescriptionOrderFromPrescriptionId(prescriptionOrderId: string, currentObjectName: string) {
    // Get the prescription order by its ID
    const prescriptionOrder = await this.prisma.prescriptionOrder.findUnique({
      where: { id: prescriptionOrderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!prescriptionOrder) {
      throw new NotFoundException("Prescription order not found")
    }

    // Get the associated prescription details
    const prescription = await this.prisma.prescription.findUnique({
      where: { id: prescriptionOrder.prescriptionId },
    })

    if (!prescription) {
      throw new NotFoundException("Associated prescription not found")
    }

    return {
      status: prescriptionOrder.status,
      message: "Prescription order found",
      data: {
        ...prescriptionOrder,
        createdAt: prescriptionOrder.createdAt.toISOString(),
        updatedAt: prescriptionOrder.updatedAt.toISOString(),
        prescription: {
          id: prescription.id,
          patientName: prescription.patientName,
          patientAge: prescription.patientAge,
          patientGender: prescription.patientGender,
          patientWeight: prescription.patientWeight,
          patientHeight: prescription.patientHeight,
          patientBloodGroup: prescription.patientBloodGroup,
          doctorName: prescription.doctorName,
          prescriptionUrl: prescription.prescriptionUrl,
          createdAt: prescription.createdAt.toISOString(),
          updatedAt: prescription.updatedAt.toISOString(),
        },
      },
    }
  }

  async getPrescriptionById(id: string, currentObjectName: string) {
    // First, try to find if this ID is a prescription order ID
    const prescriptionOrder = await this.prisma.prescriptionOrder.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    let prescription
    let orderInfo = null

    if (prescriptionOrder) {
      // If it's a prescription order ID, get the associated prescription
      prescription = await this.prisma.prescription.findUnique({
        where: { id: prescriptionOrder.prescriptionId },
        include: {
          user: {
            select: {
              id: true,
              phone: true,
            },
          },
        },
      })
      orderInfo = {
        orderId: prescriptionOrder.id,
        status: prescriptionOrder.status,
        orderCreatedAt: prescriptionOrder.createdAt.toISOString(),
        rejectionReason: prescriptionOrder.rejectionReason,
        user: prescriptionOrder.user,
      }
    } else {
      // If it's not a prescription order ID, try to find it as a prescription ID
      prescription = await this.prisma.prescription.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              phone: true,
            },
          },
        },
      })
    }

    if (!prescription) throw new NotFoundException(`${currentObjectName} not found`)

    let signedUrl = null
    let hasError = false
    let errorMessage = null

    if (prescription.prescriptionUrl) {
      try {
        // Increase duration to 4 hours for admin viewing
        signedUrl = await this.imageService.getSignedUrl("prescriptions", prescription.prescriptionUrl, 240)
      } catch (error) {
        hasError = true

        // Provide user-friendly error messages
        if (error.status === 503) {
          errorMessage = "Storage service temporarily unavailable. Please try again later."
        } else if (error.status === 410) {
          errorMessage = "Image link expired. Please refresh the page."
        } else {
          errorMessage = "Unable to load prescription image. Please try again."
        }

        signedUrl = null
      }
    }

    const result = {
      ...prescription,
      createdAt: prescription.createdAt.toISOString(),
      updatedAt: prescription.updatedAt.toISOString(),
      prescriptionUrl: signedUrl,
      hasUrlError: hasError,
      errorMessage,
      userId: prescription.user?.id,
      userPhone: prescription.user?.phone || null,
    }

    // If we found order info, include it in the response
    if (orderInfo) {
      return {
        ...result,
        ...orderInfo,
      }
    }

    return result
  }

  // NEW: Method to update prescription order status
  async updatePrescriptionOrderStatus(orderId: string, dto: UpdatePrescriptionOrderStatusDto) {
    // Find the prescription order
    const prescriptionOrder = await this.prisma.prescriptionOrder.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!prescriptionOrder) {
      throw new NotFoundException("Prescription order not found")
    }

    // Validate status transitions
    const currentStatus = prescriptionOrder.status
    const newStatus = dto.status

    // Define valid status transitions
    const validTransitions: Record<PrescriptionOrderStatus, PrescriptionOrderStatus[]> = {
      [PrescriptionOrderStatus.UPLOADED]: [PrescriptionOrderStatus.IN_REVIEW],
      [PrescriptionOrderStatus.IN_REVIEW]: [PrescriptionOrderStatus.APPROVED, PrescriptionOrderStatus.REJECTED],
      [PrescriptionOrderStatus.APPROVED]: [PrescriptionOrderStatus.ORDERED, PrescriptionOrderStatus.IN_REVIEW],
      [PrescriptionOrderStatus.REJECTED]: [PrescriptionOrderStatus.IN_REVIEW],
      [PrescriptionOrderStatus.ORDERED]: [], // Terminal status - no further transitions
    }

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}. Valid transitions from ${currentStatus} are: ${validTransitions[currentStatus]?.join(", ") || "none"}`,
      )
    }

    // If rejecting, rejection reason is required
    if (newStatus === PrescriptionOrderStatus.REJECTED && !dto.rejectionReason) {
      throw new BadRequestException("Rejection reason is required when rejecting a prescription order")
    }

    // If not rejecting, clear rejection reason
    const rejectionReason = newStatus === PrescriptionOrderStatus.REJECTED ? dto.rejectionReason : null

    // Update the prescription order
    const updatedOrder = await this.prisma.prescriptionOrder.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        rejectionReason,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    // Get the associated prescription details
    const prescription = await this.prisma.prescription.findUnique({
      where: { id: updatedOrder.prescriptionId },
    })

    return {
      id: updatedOrder.id,
      prescriptionId: updatedOrder.prescriptionId,
      userId: updatedOrder.userId,
      status: updatedOrder.status,
      rejectionReason: updatedOrder.rejectionReason,
      createdAt: updatedOrder.createdAt.toISOString(),
      updatedAt: updatedOrder.updatedAt.toISOString(),
      user: updatedOrder.user,
      prescription: prescription
        ? {
            id: prescription.id,
            patientName: prescription.patientName,
            patientAge: prescription.patientAge,
            patientGender: prescription.patientGender,
            patientWeight: prescription.patientWeight,
            patientHeight: prescription.patientHeight,
            patientBloodGroup: prescription.patientBloodGroup,
            doctorName: prescription.doctorName,
            prescriptionUrl: prescription.prescriptionUrl,
            createdAt: prescription.createdAt.toISOString(),
            updatedAt: prescription.updatedAt.toISOString(),
          }
        : null,
    }
  }

  async createPrescriptionOrder(prescriptionId: string, dto: CreatePrescriptionOrderDto) {
    const prescription = await this.prisma.prescription.findUnique({ where: { id: prescriptionId } })

    if (!prescription) throw new NotFoundException("Prescription not found")

    const prescriptionOrder = await this.prisma.prescriptionOrder.create({
      data: {
        prescriptionId,
        userId: prescription.userId,
        status: dto.status,
        rejectionReason: dto.rejectionReason || null,
      },
    })

    return {
      ...prescriptionOrder,
      createdAt: prescriptionOrder.createdAt.toISOString(),
      updatedAt: prescriptionOrder.updatedAt.toISOString(),
    }
  }

  async createOrderWithPrescription(userId: string, prescriptionId: string) {
    // Check if prescription exists and belongs to the user
    const prescription = await this.prisma.prescription.findFirst({
      where: {
        id: prescriptionId,
        userId: userId,
      },
    })

    if (!prescription) {
      throw new NotFoundException("Prescription not found or does not belong to this user")
    }

    // Check if prescription order already exists with IN_REVIEW status
    const existingOrder = await this.prisma.prescriptionOrder.findFirst({
      where: {
        prescriptionId,
        status: PrescriptionOrderStatus.IN_REVIEW,
      },
    })

    if (existingOrder) {
      throw new NotFoundException(
        "A prescription order with IN_REVIEW status already exists for this prescription. Please wait for the current order to be processed.",
      )
    }

    // Create prescription order with IN_REVIEW status
    const prescriptionOrder = await this.prisma.prescriptionOrder.create({
      data: {
        prescriptionId,
        userId,
        status: PrescriptionOrderStatus.IN_REVIEW,
      },
    })

    return {
      ...prescriptionOrder,
      createdAt: prescriptionOrder.createdAt.toISOString(),
      updatedAt: prescriptionOrder.updatedAt.toISOString(),
      message: "Prescription order created successfully with IN_REVIEW status",
    }
  }

  async addPrescriptionOrderToCart(prescriptionOrderId: string, dto: AddPrescriptionOrderToCartDto) {
    // Find the prescription order by ID
    const prescriptionOrder = await this.prisma.prescriptionOrder.findUnique({
      where: { id: prescriptionOrderId },
    })

    if (!prescriptionOrder) {
      throw new NotFoundException("Prescription order not found")
    }

    // Get the associated prescription
    const prescription = await this.prisma.prescription.findUnique({
      where: { id: prescriptionOrder.prescriptionId },
    })

    if (!prescription) {
      throw new NotFoundException("Associated prescription not found")
    }

    // Validate that the order is in APPROVED status
    if (prescriptionOrder.status !== PrescriptionOrderStatus.APPROVED) {
      throw new BadRequestException(
        `Prescription order must be in APPROVED status to add to cart. Current status: ${prescriptionOrder.status}`,
      )
    }

    const userId = prescriptionOrder.userId
    const prescriptionId = prescriptionOrder.prescriptionId

    // Use transaction to ensure atomicity and prevent race conditions
    const result = await this.prisma.$transaction(async (tx) => {
      // Get or create cart for user
      let cart = await tx.cart.findUnique({
        where: { userId },
        include: { products: true },
      })

      if (!cart) {
        cart = await tx.cart.create({
          data: {
            userId,
            prescriptionId,
            prescriptionOrderId,
            isPrescriptionCart: true,
          },
          include: { products: true },
        })
      } else {
        // Clear existing cart products
        await tx.cartProduct.deleteMany({
          where: { cartId: cart.id },
        })

        // Update cart with prescription information
        cart = await tx.cart.update({
          where: { id: cart.id },
          data: {
            prescriptionId,
            prescriptionOrderId,
            isPrescriptionCart: true,
          },
          include: { products: true },
        })
      }

      const cartItems = []

      // Add new products to cart
      for (const product of dto.products) {
        // Validate product and variant exist
        const productExists = await tx.product.findUnique({
          where: { id: product.product_id },
          include: {
            variants: {
              where: { id: product.variant_id },
            },
          },
        })

        if (!productExists) {
          throw new NotFoundException(`Product with ID ${product.product_id} not found`)
        }

        if (productExists.variants.length === 0) {
          throw new NotFoundException(
            `Variant with ID ${product.variant_id} not found for product ${product.product_id}`,
          )
        }

        const variant = productExists.variants[0]

        // Check stock availability
        if (variant.stock < product.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${productExists.name} (${variant.name}). Available: ${variant.stock}, Requested: ${product.quantity}`,
          )
        }

        // Add product to cart
        const cartProduct = await tx.cartProduct.create({
          data: {
            cartId: cart.id,
            productId: product.product_id,
            variantId: product.variant_id,
            quantity: product.quantity,
          },
        })

        cartItems.push({
          ...cartProduct,
          createdAt: cartProduct.createdAt.toISOString(),
          updatedAt: cartProduct.updatedAt.toISOString(),
          product: {
            id: productExists.id,
            name: productExists.name,
            variant: {
              id: variant.id,
              name: variant.name,
              price: variant.price,
              stock: variant.stock,
            },
          },
        })
      }

      // Update prescription order status to ORDERED
      const updatedOrder = await tx.prescriptionOrder.update({
        where: { id: prescriptionOrderId },
        data: {
          status: PrescriptionOrderStatus.ORDERED,
          updatedAt: new Date(),
        },
      })

      return {
        cart: {
          id: cart.id,
          userId: cart.userId,
          prescriptionId: cart.prescriptionId,
          prescriptionOrderId: cart.prescriptionOrderId,
          isPrescriptionCart: cart.isPrescriptionCart,
          createdAt: cart.createdAt.toISOString(),
          updatedAt: cart.updatedAt.toISOString(),
        },
        cartItems,
        prescriptionOrder: {
          id: updatedOrder.id,
          status: updatedOrder.status,
          updatedAt: updatedOrder.updatedAt.toISOString(),
        },
      }
    })

    return {
      message: "Prescription order added to cart successfully and status updated to ORDERED",
      data: result,
    }
  }

  getImageName(name: string) {
    return name.toLowerCase().replace(/ /g, "_")
  }
}
