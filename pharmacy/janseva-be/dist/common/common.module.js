"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const common_service_1 = require("./common.service");
const prisma_service_1 = require("../prisma/prisma.service");
const product_service_1 = require("../product/product.service");
const category_service_1 = require("../category/category.service");
const brand_service_1 = require("../brand/brand.service");
const common_controller_1 = require("./common.controller");
const image_service_1 = require("../utils/image.service");
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [common_controller_1.CommonController],
        providers: [common_service_1.CommonService, prisma_service_1.PrismaService, image_service_1.ImageService, product_service_1.ProductService, category_service_1.CategoryService, brand_service_1.BrandService],
        exports: [common_service_1.CommonService],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map