"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const image_service_1 = require("../utils/image.service");
const client_1 = require("@prisma/client");
let UserService = class UserService {
    constructor(prisma, imageService) {
        this.prisma = prisma;
        this.imageService = imageService;
    }
    async sanitizeUser(user) {
        const { password, profile, _count, orderSummary, ...base } = user;
        let signedProfileUrl;
        if (profile?.profileImageUrl) {
            try {
                signedProfileUrl = await this.imageService.getSignedUrl("profiles", profile.profileImageUrl, 240);
            }
            catch (error) {
                console.error("Error generating signed URL for profile image:", error);
                signedProfileUrl = undefined;
            }
        }
        return {
            ...base,
            createdAt: base.createdAt.toISOString(),
            updatedAt: base.updatedAt.toISOString(),
            profile: profile
                ? {
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    age: profile.age,
                    gender: profile.gender,
                    phone: profile.phone,
                    profileImageUrl: signedProfileUrl,
                }
                : undefined,
            orderSummary: _count && orderSummary ? {
                totalOrders: _count.orders,
                totalSpent: orderSummary.totalSpent,
            } : undefined,
        };
    }
    async sanitizeOrder(order) {
        return {
            id: order.id,
            orderId: order.orderId,
            date: order.date.toISOString(),
            status: order.status,
            orderTotal: order.orderTotal,
        };
    }
    async findAll(page = 1, limit = 10, search = "") {
        try {
            const skip = (page - 1) * limit;
            const whereClause = {
                role: { not: "ADMIN" },
                ...(search &&
                    search.trim() && {
                    OR: [
                        { name: { contains: search.trim(), mode: client_1.Prisma.QueryMode.insensitive } },
                        { email: { contains: search.trim(), mode: client_1.Prisma.QueryMode.insensitive } },
                    ],
                }),
            };
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
                                            not: client_1.OrderStatus.PAYMENT_PENDING,
                                        },
                                    },
                                },
                            },
                        },
                    },
                }),
            ]);
            const usersWithOrderSummary = await Promise.all(users.map(async (user) => {
                const orderTotal = await this.prisma.order.aggregate({
                    where: {
                        userId: user.id,
                        status: {
                            not: client_1.OrderStatus.PAYMENT_PENDING,
                        },
                    },
                    _sum: {
                        orderTotal: true,
                    },
                });
                return {
                    ...user,
                    orderSummary: {
                        totalSpent: orderTotal._sum.orderTotal || 0,
                    },
                };
            }));
            const data = await Promise.all(usersWithOrderSummary.map((u) => this.sanitizeUser(u)));
            return {
                data,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            console.error("Error in findAll:", error);
            throw error;
        }
    }
    async findOne(id) {
        try {
            const user = await this.prisma.user.findFirst({
                where: { id, role: { not: "ADMIN" } },
                include: { profile: true },
            });
            if (!user) {
                throw new common_1.NotFoundException(`User with ID ${id} not found or is an admin`);
            }
            return this.sanitizeUser(user);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            console.error("Error in findOne:", error);
            throw error;
        }
    }
    async findUserOrders(userId, page = 1, limit = 10, search = "") {
        try {
            const skip = (page - 1) * limit;
            const user = await this.prisma.user.findFirst({
                where: { id: userId, role: { not: "ADMIN" } },
            });
            if (!user) {
                throw new common_1.NotFoundException(`User with ID ${userId} not found or is an admin`);
            }
            const baseWhereClause = {
                userId: userId,
                status: {
                    not: client_1.OrderStatus.PAYMENT_PENDING,
                },
            };
            let whereClause = baseWhereClause;
            if (search && search.trim()) {
                const trimmedSearch = search.trim();
                const searchConditions = [];
                searchConditions.push({
                    orderId: { contains: trimmedSearch, mode: client_1.Prisma.QueryMode.insensitive },
                });
                const validStatuses = Object.values(client_1.OrderStatus);
                const matchingStatuses = validStatuses.filter((status) => status.toLowerCase().includes(trimmedSearch.toLowerCase()));
                if (matchingStatuses.length > 0) {
                    searchConditions.push({
                        status: { in: matchingStatuses },
                    });
                }
                const searchNumber = Number.parseFloat(trimmedSearch);
                if (!isNaN(searchNumber) && searchNumber > 0) {
                    searchConditions.push({
                        orderTotal: { equals: searchNumber },
                    });
                }
                if (trimmedSearch.startsWith(">")) {
                    const rangeValue = Number.parseFloat(trimmedSearch.substring(1));
                    if (!isNaN(rangeValue)) {
                        searchConditions.push({
                            orderTotal: { gt: rangeValue },
                        });
                    }
                }
                else if (trimmedSearch.startsWith("<")) {
                    const rangeValue = Number.parseFloat(trimmedSearch.substring(1));
                    if (!isNaN(rangeValue)) {
                        searchConditions.push({
                            orderTotal: { lt: rangeValue },
                        });
                    }
                }
                whereClause = {
                    ...baseWhereClause,
                    OR: searchConditions,
                };
            }
            const [total, orders] = await this.prisma.$transaction([
                this.prisma.order.count({ where: whereClause }),
                this.prisma.order.findMany({
                    skip,
                    take: limit,
                    where: whereClause,
                    orderBy: { date: "desc" },
                }),
            ]);
            const data = await Promise.all(orders.map((order) => this.sanitizeOrder(order)));
            const allOrdersWhereClause = {
                userId: userId,
                status: {
                    not: client_1.OrderStatus.PAYMENT_PENDING,
                },
            };
            const allOrders = await this.prisma.order.findMany({
                where: allOrdersWhereClause,
            });
            const totalSpent = allOrders.reduce((sum, order) => sum + order.orderTotal, 0);
            const lastOrderDate = allOrders.length > 0
                ? allOrders.sort((a, b) => b.date.getTime() - a.date.getTime())[0].date.toISOString()
                : undefined;
            const statusCounts = await this.prisma.order.groupBy({
                by: ["status"],
                where: allOrdersWhereClause,
                _count: {
                    status: true,
                },
            });
            const orderSummary = {
                totalOrders: allOrders.length,
                totalSpent,
                lastOrderDate,
                statusBreakdown: {
                    PAYMENT_FAILED: statusCounts.find((s) => s.status === client_1.OrderStatus.PAYMENT_FAILED)?._count.status || 0,
                    PLACED: statusCounts.find((s) => s.status === client_1.OrderStatus.PLACED)?._count.status || 0,
                    SHIPPED: statusCounts.find((s) => s.status === client_1.OrderStatus.SHIPPED)?._count.status || 0,
                    IN_TRANSIT: statusCounts.find((s) => s.status === client_1.OrderStatus.IN_TRANSIT)?._count.status || 0,
                    DELIVERED: statusCounts.find((s) => s.status === client_1.OrderStatus.DELIVERED)?._count.status || 0,
                    RETURNED: statusCounts.find((s) => s.status === client_1.OrderStatus.RETURNED)?._count.status || 0,
                    REFUNDED: statusCounts.find((s) => s.status === client_1.OrderStatus.REFUNDED)?._count.status || 0,
                },
            };
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
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            console.error("Error in findUserOrders:", error);
            throw error;
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        image_service_1.ImageService])
], UserService);
//# sourceMappingURL=user.service.js.map