export declare class OtpService {
    private readonly logger;
    generateOTP(): string;
    sendOTPEmail(email: string, otp: string): Promise<void>;
}
