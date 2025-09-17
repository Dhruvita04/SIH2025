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
exports.CartController = void 0;
const common_1 = require("@nestjs/common");
const cart_service_1 = require("./cart.service");
const add_to_cart_dto_1 = require("./dto/add-to-cart.dto");
const sync_cart_dto_1 = require("./dto/sync-cart.dto");
const delete_cart_item_dto_1 = require("./dto/delete-cart-item.dto");
const update_cart_dto_1 = require("./dto/update-cart.dto");
let CartController = class CartController {
    constructor(cartService) {
        this.cartService = cartService;
    }
    async addToCart(data) {
        return this.cartService.addToCart(data);
    }
    async updateCartItem(data) {
        return this.cartService.updateCartItem(data);
    }
    async syncCart(data) {
        return this.cartService.syncCart(data);
    }
    async deleteCartItem(data) {
        return this.cartService.deleteCartItem(data);
    }
    async changePrescription(body) {
        return this.cartService.changePrescription(body.userId, body.prescriptionId);
    }
    async getCartData(data) {
        return this.cartService.getCartData(data.data);
    }
};
exports.CartController = CartController;
__decorate([
    (0, common_1.Post)('add'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_to_cart_dto_1.AddToCartDto]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "addToCart", null);
__decorate([
    (0, common_1.Put)('update-quantity'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_cart_dto_1.UpdateCartItemDto]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "updateCartItem", null);
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sync_cart_dto_1.SyncCartDto]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "syncCart", null);
__decorate([
    (0, common_1.Delete)('remove'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [delete_cart_item_dto_1.DeleteCartItemDto]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "deleteCartItem", null);
__decorate([
    (0, common_1.Patch)('change-prescription'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "changePrescription", null);
__decorate([
    (0, common_1.Post)("get-data"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "getCartData", null);
exports.CartController = CartController = __decorate([
    (0, common_1.Controller)('cart'),
    __metadata("design:paramtypes", [cart_service_1.CartService])
], CartController);
//# sourceMappingURL=cart.controller.js.map