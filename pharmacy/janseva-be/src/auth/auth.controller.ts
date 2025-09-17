import { Controller, Request, Post, UseGuards, Body, Get, Req, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req) {
        try {
            if (!req.user) {
                return { status: "error", message: 'Authentication failed', data: null };
            }
            const result = await this.authService.login(req.user);
            
            if (result.success) {
                return { status: "success", message: result.message, data: result };
            } else {
                return { status: "error", message: result.message, data: result };
            }
        } catch (error) {
            return { status: "error", message: error.message || 'An error occurred during login', data: null };
        }
    }

    @Post('signup')
    async signup(@Body() body: { name: string; email: string; password: string; phone?: string }) {
        try {
            // Validate required fields
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
            } else {
                return { status: "error", message: result.message, data: result };
            }
        } catch (error) {
            return { status: "error", message: error.message || 'An error occurred during signup', data: null };
        }
    }

    @Post('verifyaccount')
    async verifyAccount(@Body() body: { email?: string, otp?: string, type?: string }) {
        try {
            // Validate required fields
            if (!body.email) {
                return { status: "error", message: 'Email is required', data: null };
            }
            if (!body.otp) {
                return { status: "error", message: 'OTP is required', data: null };
            }
            if (!body.type) {
                return { status: "error", message: 'Type is required', data: null };
            }

            // Validate type against allowed values
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
            } else {
                return { status: "error", message: result.message, data: result };
            }
        } catch (error) {
            return { status: "error", message: error.message || 'An error occurred during account verification', data: null };
        }
    }

    @Post('resendotp')
    async resendOtp(@Body() body: { email?: string, type?: string }) {
        try {
            // Validate required fields
            if (!body.email) {
                return { status: "error", message: 'Email is required', data: null };
            }
            if (!body.type) {
                return { status: "error", message: 'Type is required', data: null };
            }

            // Validate type against allowed values
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
            } else {
                return { status: "error", message: result.message, data: result };
            }
        } catch (error) {
            return { status: "error", message: error.message || 'An error occurred while resending OTP', data: null };
        }
    }

    @Post('forgotpassword')
    async forgotPassword(@Body() body: { email?: string }) {
        try {
            // Validate required fields
            if (!body.email) {
                return { status: "error", message: 'Email is required', data: null };
            }

            const result = await this.authService.forgotPassword(body.email);
            
            if (result.success) {
                return { status: "success", message: result.message, data: result };
            } else {
                return { status: "error", message: result.message, data: result };
            }
        } catch (error) {
            return { status: "error", message: error.message || 'An error occurred during forgot password process', data: null };
        }
    }

    @Post('validateforgotpasswordotp')
    async validateForgotPasswordOTP(@Body() body: { email?: string, otp?: string, type?: string }) {
        try {
            // Validate required fields
            if (!body.email) {
                return { status: "error", message: 'Email is required', data: null };
            }
            if (!body.otp) {
                return { status: "error", message: 'OTP is required', data: null };
            }
            if (!body.type) {
                return { status: "error", message: 'Type is required', data: null };
            }

            // Validate type against allowed values
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
            } else {
                return { status: "error", message: result.message, data: result };
            }
        } catch (error) {
            return { status: "error", message: error.message || 'An error occurred while validating OTP', data: null };
        }
    }

    @Post('resendforgotpassword')
    async resendForgotPasswordOTP(@Body() body: { email?: string }) {
        try {
            // Validate required fields
            if (!body.email) {
                return { status: "error", message: 'Email is required', data: null };
            }

            const result = await this.authService.resendForgotPasswordOTP(body.email);
            
            if (result.success) {
                return { status: "success", message: result.message, data: result };
            } else {
                return { status: "error", message: result.message, data: result };
            }
        } catch (error) {
            return { status: "error", message: error.message || 'An error occurred while resending forgot password OTP', data: null };
        }
    }

    @Post('changepassword')
    async changePassword(@Body() body: { email?: string, password?: string }) {
        try {
            // Validate required fields
            if (!body.email) {
                return { status: "error", message: 'Email is required', data: null };
            }
            if (!body.password) {
                return { status: "error", message: 'Password is required', data: null };
            }

            const result = await this.authService.changePassword(body.email, body.password);
            
            if (result.success) {
                return { status: "success", message: result.message, data: result };
            } else {
                return { status: "error", message: result.message, data: result };
            }
        } catch (error) {
            return { status: "error", message: error.message || 'An error occurred while changing password', data: null };
        }
    }

    // Google Login/Signup
    @Post('google')
    async googleLogin(@Body('code') code: string) {
        try {
            // Validate required fields
            if (!code) {
                return { status: "error", message: 'Google authorization code is required', data: null };
            }

            const result = await this.authService.handleGoogleAuth(code);
            
            if (result.success) {
                return { status: "success", message: result.message, data: result };
            } else {
                return { status: "error", message: result.message, data: result };
            }
        } catch (error) {
            return { status: "error", message: error.message || 'An error occurred during Google authentication', data: error };
        }
    }

    // Token Validation API
    @UseGuards(JwtAuthGuard)
    @Get('validate-token')
    async validateToken(@Request() req) {
        try {
            const result = await this.authService.validateToken(req.user);
            return { status: "success", message: 'Token is valid', data: result };
        } catch (error) {
            return { status: "error", message: error.message || 'Token validation failed', data: null };
        }
    }
}
