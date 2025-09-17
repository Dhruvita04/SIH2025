// src/auth/otp/otp.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTPEmail(email: string, otp: string): Promise<void> {
    // Placeholder for email sending logic
    // In a real application, you would integrate with an email service here
    console.log(`Simulating OTP ${otp} sent to ${email}`);
    this.logger.log(`Simulating OTP ${otp} sent to ${email}`);
    // Throw an error if the email sending fails in your actual implementation
    // throw new Error('Failed to send OTP email');
  }
}
