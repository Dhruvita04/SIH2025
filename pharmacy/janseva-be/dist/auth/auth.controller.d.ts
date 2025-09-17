import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
        status: string;
        message: string;
        data: {
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
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    signup(body: {
        name: string;
        email: string;
        password: string;
        phone?: string;
    }): Promise<{
        status: string;
        message: string;
        data: {
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
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    verifyAccount(body: {
        email?: string;
        otp?: string;
        type?: string;
    }): Promise<{
        status: string;
        message: string;
        data: {
            success: boolean;
            type: string;
            isExpired: boolean;
            message: string;
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    resendOtp(body: {
        email?: string;
        type?: string;
    }): Promise<{
        status: string;
        message: string;
        data: {
            success: boolean;
            type: string;
            message: string;
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    forgotPassword(body: {
        email?: string;
    }): Promise<{
        status: string;
        message: string;
        data: {
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
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    validateForgotPasswordOTP(body: {
        email?: string;
        otp?: string;
        type?: string;
    }): Promise<{
        status: string;
        message: string;
        data: {
            success: boolean;
            type: string;
            isExpired: boolean;
            message: string;
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    resendForgotPasswordOTP(body: {
        email?: string;
    }): Promise<{
        status: string;
        message: string;
        data: {
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
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    changePassword(body: {
        email?: string;
        password?: string;
    }): Promise<{
        status: string;
        message: string;
        data: {
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
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    googleLogin(code: string): Promise<{
        status: string;
        message: any;
        data: any;
    }>;
    validateToken(req: any): Promise<{
        status: string;
        message: string;
        data: {
            valid: boolean;
            user_id: string;
            role: string;
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
}
