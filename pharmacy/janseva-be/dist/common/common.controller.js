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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonController = void 0;
const common_1 = require("@nestjs/common");
const common_service_1 = require("./common.service");
let CommonController = class CommonController {
    constructor(commonService) {
        this.commonService = commonService;
        this.currentObjectName = 'Common';
    }
    async getSearchBarProducts(page, limit, search) {
        try {
            const results = await this.commonService.getSearchBarResults(page, limit, search);
            return {
                status: 'success',
                message: 'Search results retrieved successfully',
                data: results
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    }
    async getSearchPageProducts(body) {
        try {
            const results = await this.commonService.getSearchPageResults(body);
            return {
                status: 'success',
                message: 'Search results retrieved successfully',
                data: results
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    }
    async getFilters() {
        try {
            const results = await this.commonService.getFilters();
            return {
                status: 'success',
                message: 'Filters retrieved successfully',
                data: results
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    }
};
exports.CommonController = CommonController;
__decorate([
    (0, common_1.Get)('search-bar'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], CommonController.prototype, "getSearchBarProducts", null);
__decorate([
    (0, common_1.Post)('searchpage'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommonController.prototype, "getSearchPageProducts", null);
__decorate([
    (0, common_1.Get)('filters'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommonController.prototype, "getFilters", null);
exports.CommonController = CommonController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [common_service_1.CommonService])
], CommonController);
//# sourceMappingURL=common.controller.js.map