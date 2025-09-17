// src/users/user.service.ts

import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { ImageService } from "../utils/image.service"
import { UserDto, UserProfileDto, OrderDto } from "./dto/user.dto"
import { Prisma, User, UserProfile, Order, OrderStatus } from "@prisma/client"

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageService: ImageService,
  ) {}

  private async sanitizeUser(user: User & { profile?: UserProfile; _count?: { orders: number }; orderSummary?: { totalSpent: number } }): Promise<UserDto> {
    const { password, profile, _count, orderSummary, ...base } = user

    // generate signed URL for profile image if exists
    let signedProfileUrl: string | undefined
    if (profile?.profileImageUrl) {
      try {
        signedProfileUrl = await this.imageService.getSignedUrl("profiles", profile.profileImageUrl, 240)
      } catch (error) {
        console.error("Error generating signed URL for profile image:", error)
        signedProfileUrl = undefined
      }
    }

    return {
      ...base,
      createdAt: base.createdAt.toISOString(),
      updatedAt: base.updatedAt.toISOString(),

      // nested profile
      profile: profile
        ? ({
            firstName: profile.firstName,
            lastName: profile.lastName,
            age: profile.age,
            gender: profile.gender,
            phone: profile.phone,
            profileImageUrl: signedProfileUrl,
          } as UserProfileDto)
        : undefined,

      // order summary for user list
      orderSummary: _count && orderSummary ? {
        totalOrders: _count.orders,
        totalSpent: orderSummary.totalSpent,
      } : undefined,
    }
  }

  private async sanitizeOrder(order: Order): Promise<OrderDto> {
    return {
      id: order.id,
      orderId: order.orderId,
      date: order.date.toISOString(),
      status: order.status,
      orderTotal: order.orderTotal,
    }
  }

  async findAll(page = 1, limit = 10, search = "") {
    try {
      const skip = (page - 1) * limit

      const whereClause: Prisma.UserWhereInput = {
        role: { not: "ADMIN" },
        ...(search &&
          search.trim() && {
            OR: [
              { name: { contains: search.trim(), mode: Prisma.QueryMode.insensitive } },
              { email: { contains: search.trim(), mode: Prisma.QueryMode.insensitive } },
            ],
          }),
      }

      const [total, users] = await this.prisma.$transaction([
        this.prisma.user.count({ where: whereClause }),
        this.prisma.user.findMany({
          skip,
          take: limit,
          where: whereClause,
          orderBy: { createdAt: "desc" },
          include: { 
            profile: true,
            _count: {
              select: {
                orders: {
                  where: {
                    status: {
                      not: OrderStatus.PAYMENT_PENDING,
                    },
                  },
                },
              },
            },
          },
        }),
      ])

      // Get order totals for each user
      const usersWithOrderSummary = await Promise.all(
        users.map(async (user) => {
          const orderTotal = await this.prisma.order.aggregate({
            where: {
              userId: user.id,
              status: {
                not: OrderStatus.PAYMENT_PENDING,
              },
            },
            _sum: {
              orderTotal: true,
            },
          })

          return {
            ...user,
            orderSummary: {
              totalSpent: orderTotal._sum.orderTotal || 0,
            },
          }
        })
      )

      const data = await Promise.all(usersWithOrderSummary.map((u) => this.sanitizeUser(u)))

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      console.error("Error in findAll:", error)
      throw error
    }
  }

  async findOne(id: string): Promise<UserDto> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id, role: { not: "ADMIN" } },
        include: { profile: true },
      })

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found or is an admin`)
      }

      return this.sanitizeUser(user)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      console.error("Error in findOne:", error)
      throw error
    }
  }

  async findUserOrders(userId: string, page = 1, limit = 10, search = "") {
    try {
      const skip = (page - 1) * limit



      // First check if user exists and is not admin
      const user = await this.prisma.user.findFirst({
        where: { id: userId, role: { not: "ADMIN" } },
      })

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found or is an admin`)
      }

      // Build base where clause
      const baseWhereClause: Prisma.OrderWhereInput = {
        userId: userId,
        status: {
          not: OrderStatus.PAYMENT_PENDING,
        },
      }

      // Build search conditions if search term is provided
      let whereClause = baseWhereClause

      if (search && search.trim()) {
        const trimmedSearch = search.trim()


        const searchConditions: Prisma.OrderWhereInput[] = []

        // Search by order ID (case-insensitive partial match)
        searchConditions.push({
          orderId: { contains: trimmedSearch, mode: Prisma.QueryMode.insensitive },
        })

        // Search by status (case-insensitive partial match for better UX)
        // This allows searching for "place" to find "PLACED" orders
        const validStatuses = Object.values(OrderStatus)
        const matchingStatuses = validStatuses.filter((status) =>
          status.toLowerCase().includes(trimmedSearch.toLowerCase()),
        )

        if (matchingStatuses.length > 0) {
          searchConditions.push({
            status: { in: matchingStatuses },
          })
        }

        // Search by order total (exact match if search is a number)
        const searchNumber = Number.parseFloat(trimmedSearch)
        if (!isNaN(searchNumber) && searchNumber > 0) {
          searchConditions.push({
            orderTotal: { equals: searchNumber },
          })
        }

        // Search by order total range (if search contains range indicators)
        if (trimmedSearch.startsWith(">")) {
          const rangeValue = Number.parseFloat(trimmedSearch.substring(1))
          if (!isNaN(rangeValue)) {
            searchConditions.push({
              orderTotal: { gt: rangeValue },
            })
          }
        } else if (trimmedSearch.startsWith("<")) {
          const rangeValue = Number.parseFloat(trimmedSearch.substring(1))
          if (!isNaN(rangeValue)) {
            searchConditions.push({
              orderTotal: { lt: rangeValue },
            })
          }
        }



        // Combine base conditions with search conditions
        whereClause = {
          ...baseWhereClause,
          OR: searchConditions,
        }
      }



      const [total, orders] = await this.prisma.$transaction([
        this.prisma.order.count({ where: whereClause }),
        this.prisma.order.findMany({
          skip,
          take: limit,
          where: whereClause,
          orderBy: { date: "desc" },
        }),
      ])



      const data = await Promise.all(orders.map((order) => this.sanitizeOrder(order)))

      // Calculate order summary for all orders (not just filtered ones)
      const allOrdersWhereClause: Prisma.OrderWhereInput = {
        userId: userId,
        status: {
          not: OrderStatus.PAYMENT_PENDING,
        },
      }

      const allOrders = await this.prisma.order.findMany({
        where: allOrdersWhereClause,
      })

      const totalSpent = allOrders.reduce((sum, order) => sum + order.orderTotal, 0)
      const lastOrderDate =
        allOrders.length > 0
          ? allOrders.sort((a, b) => b.date.getTime() - a.date.getTime())[0].date.toISOString()
          : undefined

      // Get status counts (excluding PAYMENT_PENDING)
      const statusCounts = await this.prisma.order.groupBy({
        by: ["status"],
        where: allOrdersWhereClause,
        _count: {
          status: true,
        },
      })

      const orderSummary = {
        totalOrders: allOrders.length,
        totalSpent,
        lastOrderDate,
        statusBreakdown: {
          PAYMENT_FAILED: statusCounts.find((s) => s.status === OrderStatus.PAYMENT_FAILED)?._count.status || 0,
          PLACED: statusCounts.find((s) => s.status === OrderStatus.PLACED)?._count.status || 0,
          SHIPPED: statusCounts.find((s) => s.status === OrderStatus.SHIPPED)?._count.status || 0,
          IN_TRANSIT: statusCounts.find((s) => s.status === OrderStatus.IN_TRANSIT)?._count.status || 0,
          DELIVERED: statusCounts.find((s) => s.status === OrderStatus.DELIVERED)?._count.status || 0,
          RETURNED: statusCounts.find((s) => s.status === OrderStatus.RETURNED)?._count.status || 0,
          REFUNDED: statusCounts.find((s) => s.status === OrderStatus.REFUNDED)?._count.status || 0,
        },
      }

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        orderSummary,
        searchApplied: !!(search && search.trim()),
        searchTerm: search && search.trim() ? search.trim() : undefined,
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      console.error("Error in findUserOrders:", error)
      throw error
    }
  }
}
