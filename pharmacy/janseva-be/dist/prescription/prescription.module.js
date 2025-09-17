"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionModule = void 0;
const common_1 = require("@nestjs/common");
const prescription_service_1 = require("./prescription.service");
const prescription_controller_1 = require("./prescription.controller");
const prisma_service_1 = require("../prisma/prisma.service");
const image_service_1 = require("../utils/image.service");
let PrescriptionModule = class PrescriptionModule {
};
exports.PrescriptionModule = PrescriptionModule;
exports.PrescriptionModule = PrescriptionModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [prescription_controller_1.PrescriptionController],
        providers: [prescription_service_1.PrescriptionService, prisma_service_1.PrismaService, image_service_1.ImageService],
        exports: [prescription_service_1.PrescriptionService],
    })
], PrescriptionModule);
//# sourceMappingURL=prescription.module.js.map