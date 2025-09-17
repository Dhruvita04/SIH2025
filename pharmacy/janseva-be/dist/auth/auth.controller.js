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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const local_auth_guard_1 = require("./local-auth.guard");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async login(req) {
        try {
            if (!req.user) {
                return { status: "error", message: 'Authentication failed', data: null };
            }
            const result = await this.authService.login(req.user);
            if (result.success) {
                return { status: "success", message: result.message, data: result };
            }
            else {
                return { status: "error", message: result.message, data: result };
            }
        }
        catch (error) {
            return { status: "error", message: error.message || 'An error occurred during login', data: null };
        }
    }
    async signup(body) {
        try {
            if (!body.name) {
                return { status: "error", message: 'Name is required', data: null };
            }
            if (!body.email) {
                return { status: "error", message: 'Email is required', data: null };
            }
            if (!body.password) {
                return { status: "error", message: 'Password is required', data: null };
            }
            const result = await this.authService.register(body.name, body.email, body.password, body.phone);
            if (result.success) {
                return { status: "success", message: result.message, data: result };
            }
            else {
                return { status: "error", message: result.message, data: result };
            }
        }
        catch (error) {
            return { status: "error", message: error.message || 'An error occurred during signup', data: null };
        }
    }
    async verifyAccount(body) {
        try {
            if (!body.email) {
                return { status: "error", message: 'Email is required', data: null };
            }
            if (!body.otp) {
                return { status: "error", message: 'OTP is required', data: null };
            }
            if (!body.type) {
                return { status: "error", message: 'Type is required', data: null };
            }
            if (body.type !== 'REGISTRATION' && body.type !== 'PASSWORD_RESET') {
                return {
                    status: "error",
                    message: 'Invalid type. Allowed values are: REGISTRATION, PASSWORD_RESET',
                    data: null
                };
            }
            const result = await this.authService.verifyOTP(body.email, body.otp, body.type);
            if (result.success) {
                return { status: "success", message: result.message, data: result };
            }
            else {
                return { status: "error", message: result.message, data: result };
            }
        }
        catch (error) {
            return { status: "error", message: error.message || 'An error occurred during account verification', data: null };
        }
    }
    async resendOtp(body) {
        try {
            if (!body.email) {
                return { status: "error", message: 'Email is required', data: null };
            }
            if (!body.type) {
                return { status: "error", message: 'Type is required', data: null };
            }
            if (body.type !== 'REGISTRATION' && body.type !== 'PASSWORD_RESET') {
                return {
                    status: "error",
                    message: 'Invalid type. Allowed values are: REGISTRATION, PASSWORD_RESET',
                    data: null
                };
            }
            const result = await this.authService.resendOtp(body.email, body.type);
            if (result.success) {
                return { status: "success", message: result.message, data: result };
            }
            else {
                return { status: "error", message: result.message, data: result };
            }
        }
        catch (error) {
            return { status: "error", message: error.message || 'An error occurred while resending OTP', data: null };
        }
    }
    async forgotPassword(body) {
        try {
            if (!body.email) {
                return { status: "error", message: 'Email is required', data: null };
            }
            const result = await this.authService.forgotPassword(body.email);
            if (result.success) {
                return { status: "success", message: result.message, data: result };
            }
            else {
                return { status: "error", message: result.message, data: result };
            }
        }
        catch (error) {
            return { status: "error", message: error.message || 'An error occurred during forgot password process', data: null };
        }
    }
    async validateForgotPasswordOTP(body) {
        try {
            if (!body.email) {
                return { status: "error", message: 'Email is required', data: null };
            }
            if (!body.otp) {
                return { status: "error", message: 'OTP is required', data: null };
            }
            if (!body.type) {
                return { status: "error", message: 'Type is required', data: null };
            }
            if (body.type !== 'REGISTRATION' && body.type !== 'PASSWORD_RESET') {
                return {
                    status: "error",
                    message: 'Invalid type. Allowed values are: REGISTRATION, PASSWORD_RESET',
                    data: null
                };
            }
            const result = await this.authService.verifyOTP(body.email, body.otp, body.type);
            if (result.success) {
                return { status: "success", message: result.message, data: result };
            }
            else {
                return { status: "error", message: result.message, data: result };
            }
        }
        catch (error) {
            return { status: "error", message: error.message || 'An error occurred while validating OTP', data: null };
        }
    }
    async resendForgotPasswordOTP(body) {
        try {
            if (!body.email) {
                return { status: "error", message: 'Email is required', data: null };
            }
            const result = await this.authService.resendForgotPasswordOTP(body.email);
            if (result.success) {
                return { status: "success", message: result.message, data: result };
            }
            else {
                return { status: "error", message: result.message, data: result };
            }
        }
        catch (error) {
            return { status: "error", message: error.message || 'An error occurred while resending forgot password OTP', data: null };
        }
    }
    async changePassword(body) {
        try {
            if (!body.email) {
                return { status: "error", message: 'Email is required', data: null };
            }
            if (!body.password) {
                return { status: "error", message: 'Password is required', data: null };
            }
            const result = await this.authService.changePassword(body.email, body.password);
            if (result.success) {
                return { status: "success", message: result.message, data: result };
            }
            else {
                return { status: "error", message: result.message, data: result };
            }
        }
        catch (error) {
            return { status: "error", message: error.message || 'An error occurred while changing password', data: null };
        }
    }
    async googleLogin(code) {
        try {
            if (!code) {
                return { status: "error", message: 'Google authorization code is required', data: null };
            }
            const result = await this.authService.handleGoogleAuth(code);
            if (result.success) {
                return { status: "success", message: result.message, data: result };
            }
            else {
                return { status: "error", message: result.message, data: result };
            }
        }
        catch (error) {
            return { status: "error", message: error.message || 'An error occurred during Google authentication', data: error };
        }
    }
    async validateToken(req) {
        try {
            const result = await this.authService.validateToken(req.user);
            return { status: "success", message: 'Token is valid', data: result };
        }
        catch (error) {
            return { status: "error", message: error.message || 'Token validation failed', data: null };
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.UseGuards)(local_auth_guard_1.LocalAuthGuard),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('signup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)('verifyaccount'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyAccount", null);
__decorate([
    (0, common_1.Post)('resendotp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendOtp", null);
__decorate([
    (0, common_1.Post)('forgotpassword'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('validateforgotpasswordotp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateForgotPasswordOTP", null);
__decorate([
    (0, common_1.Post)('resendforgotpassword'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendForgotPasswordOTP", null);
__decorate([
    (0, common_1.Post)('changepassword'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('google'),
    __param(0, (0, common_1.Body)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleLogin", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('validate-token'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateToken", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map