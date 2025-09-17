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
exports.PrescriptionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const image_service_1 = require("../utils/image.service");
const client_1 = require("@prisma/client");
let PrescriptionService = class PrescriptionService {
    constructor(prisma, imageService) {
        this.prisma = prisma;
        this.imageService = imageService;
    }
    async createPrescription(dto, file, currentObjectName) {
        const count = await this.prisma.prescription.count({
            where: { userId: dto.userId },
        });
        const prescriptionUrl = await this.imageService.uploadImage("prescriptions", `${this.getImageName(dto.userId)}_${count + 1}`, file.mimetype.toString(), file.buffer);
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
        });
        if (!prescription)
            throw new common_1.NotFoundException(`${currentObjectName} not created`);
        return prescription;
    }
    async getAllPrescriptions(page = 1, limit = 10, search, status) {
        const skip = (page - 1) * limit;
        const whereClause = {};
        if (status && status !== "ALL") {
            whereClause.status = status;
        }
        if (search && search.trim() !== "") {
            const searchTerm = search.trim();
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
            });
            const matchingUsers = await this.prisma.user.findMany({
                where: {
                    OR: [
                        { name: { contains: searchTerm, mode: "insensitive" } },
                        { email: { contains: searchTerm, mode: "insensitive" } },
                        { phone: { contains: searchTerm, mode: "insensitive" } },
                    ],
                },
                select: { id: true },
            });
            const prescriptionIds = matchingPrescriptions.map((p) => p.id);
            const userIds = matchingUsers.map((u) => u.id);
            whereClause.OR = [];
            if (prescriptionIds.length > 0) {
                whereClause.OR.push({ prescriptionId: { in: prescriptionIds } });
            }
            if (userIds.length > 0) {
                whereClause.OR.push({ userId: { in: userIds } });
            }
            const searchAsNumber = Number.parseInt(searchTerm, 10);
            if (!isNaN(searchAsNumber)) {
                const ageMatchingPrescriptions = await this.prisma.prescription.findMany({
                    where: { patientAge: searchAsNumber },
                    select: { id: true },
                });
                const ageMatchingIds = ageMatchingPrescriptions.map((p) => p.id);
                if (ageMatchingIds.length > 0) {
                    whereClause.OR.push({ prescriptionId: { in: ageMatchingIds } });
                }
            }
            if (whereClause.OR.length === 0) {
                return {
                    data: [],
                    pagination: {
                        total: 0,
                        page,
                        limit,
                        totalPages: 0,
                    },
                };
            }
        }
        const totalCount = await this.prisma.prescriptionOrder.count({
            where: whereClause,
        });
        const prescriptionOrders = await this.prisma.prescriptionOrder.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
        });
        const prescriptionsWithStatus = await Promise.all(prescriptionOrders.map(async (prescriptionOrder) => {
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
            });
            return {
                id: prescriptionOrder.id,
                prescriptionId: prescription.id,
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
            };
        }));
        return {
            data: prescriptionsWithStatus,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
            },
        };
    }
    async getPrescriptionByUserId(userId, currentObjectName, page = 1, limit = 10, orderOnly = false) {
        const skip = (page - 1) * limit;
        if (orderOnly) {
            const prescriptionOrders = await this.prisma.prescriptionOrder.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            });
            if (prescriptionOrders.length === 0) {
                return {
                    data: [],
                    pagination: {
                        total: 0,
                        page,
                        limit,
                        totalPages: 0,
                    },
                };
            }
            const totalCount = await this.prisma.prescriptionOrder.count({
                where: { userId },
            });
            const prescriptionsWithImagesAndStatus = await Promise.all(prescriptionOrders.map(async (prescriptionOrder) => {
                const prescription = await this.prisma.prescription.findUnique({
                    where: { id: prescriptionOrder.prescriptionId },
                });
                let signedUrl = null;
                let hasError = false;
                let errorMessage = null;
                if (prescription.prescriptionUrl) {
                    try {
                        signedUrl = await this.imageService.getSignedUrl("prescriptions", prescription.prescriptionUrl, 240);
                    }
                    catch (error) {
                        hasError = true;
                        if (error.status === 503) {
                            errorMessage = "Storage service temporarily unavailable. Please try again later.";
                        }
                        else if (error.status === 410) {
                            errorMessage = "Image link expired. Please refresh the page.";
                        }
                        else {
                            errorMessage = "Unable to load prescription image. Please try again.";
                        }
                        signedUrl = null;
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
                };
            }));
            return {
                data: prescriptionsWithImagesAndStatus,
                pagination: {
                    total: totalCount,
                    page,
                    limit,
                    totalPages: Math.ceil(totalCount / limit),
                },
            };
        }
        const whereClause = { userId };
        const totalCount = await this.prisma.prescription.count({
            where: whereClause,
        });
        const prescriptions = await this.prisma.prescription.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
        });
        if (!prescriptions)
            throw new common_1.NotFoundException(`${currentObjectName} not found`);
        const prescriptionsWithImagesAndStatus = await Promise.all(prescriptions.map(async (prescription) => {
            let signedUrl = null;
            let hasError = false;
            let errorMessage = null;
            if (prescription.prescriptionUrl) {
                try {
                    signedUrl = await this.imageService.getSignedUrl("prescriptions", prescription.prescriptionUrl, 240);
                }
                catch (error) {
                    hasError = true;
                    if (error.status === 503) {
                        errorMessage = "Storage service temporarily unavailable. Please try again later.";
                    }
                    else if (error.status === 410) {
                        errorMessage = "Image link expired. Please refresh the page.";
                    }
                    else {
                        errorMessage = "Unable to load prescription image. Please try again.";
                    }
                    signedUrl = null;
                }
            }
            const prescriptionOrder = await this.prisma.prescriptionOrder.findFirst({
                where: { prescriptionId: prescription.id },
                orderBy: { createdAt: "desc" },
            });
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
                status: prescriptionOrder?.status || client_1.PrescriptionOrderStatus.UPLOADED,
            };
        }));
        return {
            data: prescriptionsWithImagesAndStatus,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
            },
        };
    }
    async getPrescriptionOrderFromPrescriptionId(prescriptionOrderId, currentObjectName) {
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
        });
        if (!prescriptionOrder) {
            throw new common_1.NotFoundException("Prescription order not found");
        }
        const prescription = await this.prisma.prescription.findUnique({
            where: { id: prescriptionOrder.prescriptionId },
        });
        if (!prescription) {
            throw new common_1.NotFoundException("Associated prescription not found");
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
        };
    }
    async getPrescriptionById(id, currentObjectName) {
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
        });
        let prescription;
        let orderInfo = null;
        if (prescriptionOrder) {
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
            });
            orderInfo = {
                orderId: prescriptionOrder.id,
                status: prescriptionOrder.status,
                orderCreatedAt: prescriptionOrder.createdAt.toISOString(),
                rejectionReason: prescriptionOrder.rejectionReason,
                user: prescriptionOrder.user,
            };
        }
        else {
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
            });
        }
        if (!prescription)
            throw new common_1.NotFoundException(`${currentObjectName} not found`);
        let signedUrl = null;
        let hasError = false;
        let errorMessage = null;
        if (prescription.prescriptionUrl) {
            try {
                signedUrl = await this.imageService.getSignedUrl("prescriptions", prescription.prescriptionUrl, 240);
            }
            catch (error) {
                hasError = true;
                if (error.status === 503) {
                    errorMessage = "Storage service temporarily unavailable. Please try again later.";
                }
                else if (error.status === 410) {
                    errorMessage = "Image link expired. Please refresh the page.";
                }
                else {
                    errorMessage = "Unable to load prescription image. Please try again.";
                }
                signedUrl = null;
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
        };
        if (orderInfo) {
            return {
                ...result,
                ...orderInfo,
            };
        }
        return result;
    }
    async updatePrescriptionOrderStatus(orderId, dto) {
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
        });
        if (!prescriptionOrder) {
            throw new common_1.NotFoundException("Prescription order not found");
        }
        const currentStatus = prescriptionOrder.status;
        const newStatus = dto.status;
        const validTransitions = {
            [client_1.PrescriptionOrderStatus.UPLOADED]: [client_1.PrescriptionOrderStatus.IN_REVIEW],
            [client_1.PrescriptionOrderStatus.IN_REVIEW]: [client_1.PrescriptionOrderStatus.APPROVED, client_1.PrescriptionOrderStatus.REJECTED],
            [client_1.PrescriptionOrderStatus.APPROVED]: [client_1.PrescriptionOrderStatus.ORDERED, client_1.PrescriptionOrderStatus.IN_REVIEW],
            [client_1.PrescriptionOrderStatus.REJECTED]: [client_1.PrescriptionOrderStatus.IN_REVIEW],
            [client_1.PrescriptionOrderStatus.ORDERED]: [],
        };
        if (!validTransitions[currentStatus]?.includes(newStatus)) {
            throw new common_1.BadRequestException(`Invalid status transition from ${currentStatus} to ${newStatus}. Valid transitions from ${currentStatus} are: ${validTransitions[currentStatus]?.join(", ") || "none"}`);
        }
        if (newStatus === client_1.PrescriptionOrderStatus.REJECTED && !dto.rejectionReason) {
            throw new common_1.BadRequestException("Rejection reason is required when rejecting a prescription order");
        }
        const rejectionReason = newStatus === client_1.PrescriptionOrderStatus.REJECTED ? dto.rejectionReason : null;
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
        });
        const prescription = await this.prisma.prescription.findUnique({
            where: { id: updatedOrder.prescriptionId },
        });
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
        };
    }
    async createPrescriptionOrder(prescriptionId, dto) {
        const prescription = await this.prisma.prescription.findUnique({ where: { id: prescriptionId } });
        if (!prescription)
            throw new common_1.NotFoundException("Prescription not found");
        const prescriptionOrder = await this.prisma.prescriptionOrder.create({
            data: {
                prescriptionId,
                userId: prescription.userId,
                status: dto.status,
                rejectionReason: dto.rejectionReason || null,
            },
        });
        return {
            ...prescriptionOrder,
            createdAt: prescriptionOrder.createdAt.toISOString(),
            updatedAt: prescriptionOrder.updatedAt.toISOString(),
        };
    }
    async createOrderWithPrescription(userId, prescriptionId) {
        const prescription = await this.prisma.prescription.findFirst({
            where: {
                id: prescriptionId,
                userId: userId,
            },
        });
        if (!prescription) {
            throw new common_1.NotFoundException("Prescription not found or does not belong to this user");
        }
        const existingOrder = await this.prisma.prescriptionOrder.findFirst({
            where: {
                prescriptionId,
                status: client_1.PrescriptionOrderStatus.IN_REVIEW,
            },
        });
        if (existingOrder) {
            throw new common_1.NotFoundException("A prescription order with IN_REVIEW status already exists for this prescription. Please wait for the current order to be processed.");
        }
        const prescriptionOrder = await this.prisma.prescriptionOrder.create({
            data: {
                prescriptionId,
                userId,
                status: client_1.PrescriptionOrderStatus.IN_REVIEW,
            },
        });
        return {
            ...prescriptionOrder,
            createdAt: prescriptionOrder.createdAt.toISOString(),
            updatedAt: prescriptionOrder.updatedAt.toISOString(),
            message: "Prescription order created successfully with IN_REVIEW status",
        };
    }
    async addPrescriptionOrderToCart(prescriptionOrderId, dto) {
        const prescriptionOrder = await this.prisma.prescriptionOrder.findUnique({
            where: { id: prescriptionOrderId },
        });
        if (!prescriptionOrder) {
            throw new common_1.NotFoundException("Prescription order not found");
        }
        const prescription = await this.prisma.prescription.findUnique({
            where: { id: prescriptionOrder.prescriptionId },
        });
        if (!prescription) {
            throw new common_1.NotFoundException("Associated prescription not found");
        }
        if (prescriptionOrder.status !== client_1.PrescriptionOrderStatus.APPROVED) {
            throw new common_1.BadRequestException(`Prescription order must be in APPROVED status to add to cart. Current status: ${prescriptionOrder.status}`);
        }
        const userId = prescriptionOrder.userId;
        const prescriptionId = prescriptionOrder.prescriptionId;
        const result = await this.prisma.$transaction(async (tx) => {
            let cart = await tx.cart.findUnique({
                where: { userId },
                include: { products: true },
            });
            if (!cart) {
                cart = await tx.cart.create({
                    data: {
                        userId,
                        prescriptionId,
                        prescriptionOrderId,
                        isPrescriptionCart: true,
                    },
                    include: { products: true },
                });
            }
            else {
                await tx.cartProduct.deleteMany({
                    where: { cartId: cart.id },
                });
                cart = await tx.cart.update({
                    where: { id: cart.id },
                    data: {
                        prescriptionId,
                        prescriptionOrderId,
                        isPrescriptionCart: true,
                    },
                    include: { products: true },
                });
            }
            const cartItems = [];
            for (const product of dto.products) {
                const productExists = await tx.product.findUnique({
                    where: { id: product.product_id },
                    include: {
                        variants: {
                            where: { id: product.variant_id },
                        },
                    },
                });
                if (!productExists) {
                    throw new common_1.NotFoundException(`Product with ID ${product.product_id} not found`);
                }
                if (productExists.variants.length === 0) {
                    throw new common_1.NotFoundException(`Variant with ID ${product.variant_id} not found for product ${product.product_id}`);
                }
                const variant = productExists.variants[0];
                if (variant.stock < product.quantity) {
                    throw new common_1.BadRequestException(`Insufficient stock for product ${productExists.name} (${variant.name}). Available: ${variant.stock}, Requested: ${product.quantity}`);
                }
                const cartProduct = await tx.cartProduct.create({
                    data: {
                        cartId: cart.id,
                        productId: product.product_id,
                        variantId: product.variant_id,
                        quantity: product.quantity,
                    },
                });
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
                });
            }
            const updatedOrder = await tx.prescriptionOrder.update({
                where: { id: prescriptionOrderId },
                data: {
                    status: client_1.PrescriptionOrderStatus.ORDERED,
                    updatedAt: new Date(),
                },
            });
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
            };
        });
        return {
            message: "Prescription order added to cart successfully and status updated to ORDERED",
            data: result,
        };
    }
    getImageName(name) {
        return name.toLowerCase().replace(/ /g, "_");
    }
};
exports.PrescriptionService = PrescriptionService;
exports.PrescriptionService = PrescriptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        image_service_1.ImageService])
], PrescriptionService);
//# sourceMappingURL=prescription.service.js.map