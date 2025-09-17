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
exports.AddressService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AddressService = class AddressService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createAddress(dto, currentObjectName) {
        try {
            const count = await this.prisma.address.count({
                where: {
                    userId: dto.userId
                }
            });
            if (count === 5) {
                throw new common_1.ConflictException('You have reached the maximum limit of 5 addresses');
            }
            if (dto.default) {
                await this.prisma.address.updateMany({
                    where: {
                        userId: dto.userId,
                        default: true
                    },
                    data: {
                        default: false
                    }
                });
            }
            return this.prisma.address.create({
                data: {
                    userId: dto.userId,
                    name: dto.name,
                    phone: dto.phone,
                    line1: dto.line1,
                    line2: dto.line2 || '',
                    city: dto.city,
                    state: dto.state,
                    postalCode: dto.postalCode,
                    default: dto.default
                },
            });
        }
        catch (error) {
            throw new common_1.NotFoundException(`Error in creating ${currentObjectName}`);
        }
    }
    async getAddressById(userId, currentObjectName) {
        try {
            const address = await this.prisma.address.findMany({ where: { userId } });
            if (!address)
                throw new common_1.NotFoundException(`${currentObjectName} not found`);
            return address;
        }
        catch (error) {
            throw new common_1.NotFoundException(`Error in getting ${currentObjectName}`);
        }
    }
    async updateAddress(id, dto, currentObjectName) {
        try {
            const address = await this.prisma.address.findUnique({ where: { id } });
            if (!address)
                throw new common_1.NotFoundException(`${currentObjectName} not found`);
            if (dto.default) {
                await this.prisma.address.updateMany({ where: { userId: address.userId, default: true }, data: { default: false } });
            }
            return this.prisma.address.update({
                where: { id },
                data: {
                    name: dto.name,
                    phone: dto.phone,
                    line1: dto.line1,
                    line2: dto.line2 || '',
                    city: dto.city,
                    state: dto.state,
                    postalCode: dto.postalCode,
                    default: dto.default
                },
            });
        }
        catch (error) {
            throw new common_1.NotFoundException(`Error in updating ${currentObjectName}`);
        }
    }
    async deleteAddress(id, currentObjectName) {
        try {
            const address = await this.prisma.address.findUnique({ where: { id } });
            if (!address)
                throw new common_1.NotFoundException(`${currentObjectName} not found`);
            await this.prisma.address.delete({ where: { id } });
            return null;
        }
        catch (error) {
            throw new common_1.NotFoundException(`Error in deleting ${currentObjectName}`);
        }
    }
    async setDefaultAddress(id, userId, currentObjectName) {
        try {
            const address = await this.prisma.address.findUnique({ where: { id } });
            if (!address)
                throw new common_1.NotFoundException(`${currentObjectName} not found`);
            await this.prisma.address.updateMany({ where: { userId, default: true }, data: { default: false } });
            return this.prisma.address.update({
                where: { id },
                data: { default: true }
            });
        }
        catch (error) {
            throw new common_1.NotFoundException(`Error in setting default ${currentObjectName}`);
        }
    }
};
exports.AddressService = AddressService;
exports.AddressService = AddressService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AddressService);
//# sourceMappingURL=address.service.js.map