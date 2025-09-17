import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from './otp/otp.service';
import { User } from '@prisma/client';
export declare class AuthService {
    private prisma;
    private jwtService;
    private otpService;
    private googleClient;
    constructor(prisma: PrismaService, jwtService: JwtService, otpService: OtpService);
    validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null>;
    login(user: User): Promise<{
        success: boolean;
        type: string;
        message: string;
        user: {
            name: string | null;
            id: string;
            email: string;
            googleId: string | null;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            isVerified: boolean;
            role: import(".prisma/client").$Enums.Role;
        };
        accessToken: string;
    }>;
    register(name: string, email: string, password: string, phone?: string): Promise<{
        success: boolean;
        message: string;
        user?: undefined;
        timestamp?: undefined;
    } | {
        success: boolean;
        user: {
            name: string | null;
            id: string;
            email: string;
            googleId: string | null;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            isVerified: boolean;
            role: import(".prisma/client").$Enums.Role;
        };
        message: string;
        timestamp: string;
    } | {
        success: boolean;
        message: string;
        timestamp: string;
        user?: undefined;
    }>;
    verifyOTP(email: string, otp: string, type: string): Promise<{
        success: boolean;
        type: string;
        isExpired: boolean;
        message: string;
    }>;
    resendOtp(email: string, type: string): Promise<{
        success: boolean;
        type: string;
        message: string;
    }>;
    private sendVerificationOTP;
    private createOTP;
    private getIndianTime;
    private sanitizeUser;
    forgotPassword(email: string): Promise<{
        success: boolean;
        message: string;
        user: any;
        isVerified: boolean;
        isGoogleUser: boolean;
    } | {
        success: boolean;
        message: string;
        user: {
            name: string | null;
            id: string;
            email: string;
            googleId: string | null;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            isVerified: boolean;
            role: import(".prisma/client").$Enums.Role;
        };
        isVerified: boolean;
        isGoogleUser?: undefined;
    }>;
    resendForgotPasswordOTP(email: string): Promise<{
        success: boolean;
        message: string;
        user: any;
        isVerified: boolean;
        isGoogleUser: boolean;
    } | {
        success: boolean;
        message: string;
        user: {
            name: string | null;
            id: string;
            email: string;
            googleId: string | null;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            isVerified: boolean;
            role: import(".prisma/client").$Enums.Role;
        };
        isVerified: boolean;
        isGoogleUser?: undefined;
    } | {
        success: boolean;
        message: string;
    }>;
    changePassword(email: string, password: string): Promise<{
        success: boolean;
        message: string;
        user: {
            name: string | null;
            id: string;
            email: string;
            googleId: string | null;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            isVerified: boolean;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    handleGoogleAuth(code: string): Promise<{
        success: boolean;
        type: string;
        message: string;
        user: {
            name: string | null;
            id: string;
            email: string;
            googleId: string | null;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            isVerified: boolean;
            role: import(".prisma/client").$Enums.Role;
        };
        accessToken: string;
        data?: undefined;
    } | {
        success: boolean;
        type: string;
        data: any;
        message: string;
        user: any;
        accessToken: any;
    }>;
    validateToken(user: any): Promise<{
        valid: boolean;
        user_id: string;
        role: string;
    }>;
}
