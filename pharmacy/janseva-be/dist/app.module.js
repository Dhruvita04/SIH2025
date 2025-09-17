"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const image_service_1 = require("./utils/image.service");
const brand_module_1 = require("./brand/brand.module");
const category_module_1 = require("./category/category.module");
const product_module_1 = require("./product/product.module");
const cart_module_1 = require("./cart/cart.module");
const prescription_module_1 = require("./prescription/prescription.module");
const profile_module_1 = require("./profile/profile.module");
const address_module_1 = require("./address/address.module");
const common_module_1 = require("./common/common.module");
const coupon_module_1 = require("./coupon/coupon.module");
const payments_module_1 = require("./payments/payments.module");
const orders_module_1 = require("./orders/orders.module");
const contact_module_1 = require("./contact/contact.module");
const user_module_1 = require("./user/user.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, image_service_1.ImageService],
        imports: [auth_module_1.AuthModule, brand_module_1.BrandModule, category_module_1.CategoryModule, product_module_1.ProductModule, cart_module_1.CartModule, prescription_module_1.PrescriptionModule, profile_module_1.ProfileModule, address_module_1.AddressModule, common_module_1.CommonModule, coupon_module_1.CouponModule, payments_module_1.PaymentsModule, orders_module_1.OrdersModule, contact_module_1.ContactModule, user_module_1.UserModule],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map