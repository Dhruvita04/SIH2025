import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from './otp/otp.service';
import { User } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
   private googleClient: OAuth2Client;

   constructor(
       private prisma: PrismaService,
       private jwtService: JwtService,
       private otpService: OtpService
   ) {
       this.googleClient = new OAuth2Client(
           process.env.GOOGLE_CLIENT_ID,
           process.env.GOOGLE_CLIENT_SECRET,
           process.env.GOOGLE_REDIRECT_URI
       );
   }

   async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
       const user = await this.prisma.user.findUnique({ where: { email } });
       
       if (user && user.password && await bcrypt.compare(password, user.password)) {
           const { password, ...result } = user;
           return result;
       }
   }

   async login(user: User) {
       try {
           if (!user.isVerified) {
               await this.sendVerificationOTP(user.email);
               return {
                   success: false,
                   type: "REGISTRATION",
                   user: null,
                   accessToken: null,
                   message: 'Account not verified. A new verification OTP has been sent to your email.',
               };
           }

           if(user.googleId && user.role !== 'ADMIN'){
               return {
                   success: false,
                   type: "login",
                   message: 'You have already logged in with Google. Please use Google to login.',
                   user: null,
                   accessToken: null,
               };
           }

           const payload = { sub: user.id, email: user.email };
           const accessToken = this.jwtService.sign(payload);

           return {
               success: true,
               type: "login",
               message: 'Login successful',
               user: this.sanitizeUser(user),
               accessToken,
           };
       } catch (error) {
           return {
               success: false,
               type: "login",
               user: null,
               accessToken: null,
               message: 'An error occurred during login',
           };
       }
   }

   async register(name: string, email: string, password: string, phone?: string) {
       try {
           const existingUser = await this.prisma.user.findUnique({ where: { email } });
           if (existingUser) {
               return { success: false, message: 'Email already in use' };
           }

           const hashedPassword = await bcrypt.hash(password, 10);
           const indianTime = this.getIndianTime();

           const user = await this.prisma.$transaction(async (prisma) => {
               const newUser = await prisma.user.create({
                   data: {
                       email,
                       password: hashedPassword,
                       name,
                       createdAt: indianTime,
                       updatedAt: indianTime,
                       role: 'USER',
                       phone,
                       isVerified: false,
                   },
               });

               await this.createOTP(prisma, email, 'REGISTRATION', indianTime);

               return newUser;
           });

           await this.sendVerificationOTP(email);

           return {
               success: true,
               user: this.sanitizeUser(user),
               message: 'Please check your email for OTP verification',
               timestamp: indianTime.toISOString()
           };
       } catch (error) {
           return {
               success: false,
               message: 'Registration failed. Please try again later.',
               timestamp: this.getIndianTime().toISOString()
           };
       }
   }

   // Unified OTP verification method that takes email, otp, and type
   async verifyOTP(email: string, otp: string, type: string) {
       try {
           // Validate type against enum values
           if (type !== 'REGISTRATION' && type !== 'PASSWORD_RESET') {
               return {
                   success: false,
                   type: type,
                   isExpired: false,
                   message: 'Invalid OTP type. Allowed values are: REGISTRATION, PASSWORD_RESET'
               };
           }

           const otpRecord = await this.prisma.oTP.findFirst({ 
               where: { 
                   email, 
                   type: type as 'REGISTRATION' | 'PASSWORD_RESET'
               } 
           });

           if (!otpRecord) {
               return {
                   success: false,
                   type: type,
                   isExpired: false,
                   message: 'Invalid OTP'
               };
           }

           if (otpRecord.expiresAt < new Date()) {
               return {
                   success: false,
                   type: type,
                   isExpired: true,
                   message: 'OTP expired'
               };
           }

           if (otpRecord.otp !== otp) {
               return {
                   success: false,
                   type: type,
                   isExpired: false,
                   message: 'Invalid OTP'
               };
           }

           // Handle different verification types
           if (type === 'REGISTRATION') {
               // Update user verification status
               await this.prisma.user.update({
                   where: { email },
                   data: { isVerified: true }
               });
           }

           // Delete the used OTP record
           await this.prisma.oTP.delete({
               where: {
                   email_type: {
                       email,
                       type: type as 'REGISTRATION' | 'PASSWORD_RESET'
                   }
               }
           });

           return {
               success: true,
               type: type,
               isExpired: false,
               message: 'OTP verified successfully'
           };
       } catch (error) {
           return {
               success: false,
               type: type,
               isExpired: false,
               message: 'Verification failed. Please try again later.'
           };
       }
   }

   async resendOtp(email: string, type: string) {
       try {
           // Validate type against enum values
           if (type !== 'REGISTRATION' && type !== 'PASSWORD_RESET') {
               return { 
                   success: false, 
                   type: type, 
                   message: 'Invalid OTP type. Allowed values are: REGISTRATION, PASSWORD_RESET' 
               };
           }

           if (type === 'REGISTRATION') {
               await this.sendVerificationOTP(email);
               return { 
                   success: true, 
                   type: type, 
                   message: 'Registration OTP resent successfully' 
               };
           } else if (type === 'PASSWORD_RESET') {
               const result = await this.forgotPassword(email);
               if (result.success) {
                   return { 
                       success: true, 
                       type: type, 
                       message: 'Password reset OTP resent successfully' 
                   };
               } else {
                   return { 
                       success: false, 
                       type: type, 
                       message: result.message 
                   };
               }
           }
       } catch (error) {
           return { 
               success: false, 
               type: type, 
               message: 'Failed to resend OTP. Please try again later.' 
           };
       }
   }

   private async sendVerificationOTP(email: string) {
       const otp = this.otpService.generateOTP();
       const indianTime = this.getIndianTime();
       const expiresAt = new Date(indianTime.getTime() + parseInt(process.env.OTP_EXPIRATION_MINUTES, 10) * 60 * 1000);

       await this.prisma.oTP.upsert({
           where: {
               email_type: {
                   email,
                   type: 'REGISTRATION',
               },
           },
           update: {
               otp,
               createdAt: indianTime,
               expiresAt,
           },
           create: {
               email,
               otp,
               type: 'REGISTRATION',
               createdAt: indianTime,
               expiresAt,
           },
       });

       await this.otpService.sendOTPEmail(email, otp);
   }

   private async createOTP(prisma: any, email: string, type: 'REGISTRATION' | 'PASSWORD_RESET', createdAt: Date) {
       const otp = this.otpService.generateOTP();
       const expiresAt = new Date(createdAt.getTime() + parseInt(process.env.OTP_EXPIRATION_MINUTES, 10) * 60 * 1000);

       await prisma.oTP.upsert({
           where: {
               email_type: {
                   email,
                   type,
               },
           },
           update: {
               otp,
               createdAt,
               expiresAt,
           },
           create: {
               email,
               otp,
               type,
               createdAt,
               expiresAt,
           },
       });
   }

   private getIndianTime(): Date {
       return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
   }

   private sanitizeUser(user: User) {
       const { password, ...sanitizedUser } = user;
       return sanitizedUser;
   }

   async forgotPassword(email: string) {
       try {
           const user = await this.prisma.user.findUnique({ where: { email } });
           if (!user) {
               return { success: false, message: 'User not found', user: null, isVerified: false };
           }

           if (!user.isVerified) {
               await this.sendVerificationOTP(email);
               return { success: false, message: 'User is not verified. A verification OTP has been sent to your email.', user: null, isVerified: false };
           }

           // Check if user is registered with Google
           if (user.googleId) {
               return { 
                   success: false, 
                   message: 'You are registered with Google. Please use Google to sign in instead of resetting your password.', 
                   user: null, 
                   isVerified: true,
                   isGoogleUser: true 
               };
           }

           const otp = this.otpService.generateOTP();
           const indianTime = this.getIndianTime();
           const expiresAt = new Date(indianTime.getTime() + parseInt(process.env.OTP_EXPIRATION_MINUTES, 10) * 60 * 1000);

           const existingOTP = await this.prisma.oTP.findUnique({
               where: {
                   email_type: {
                       email,
                       type: "PASSWORD_RESET",
                   },
               },
           });

           if (existingOTP) {
               if (existingOTP.expiresAt < indianTime) {
                   await this.prisma.oTP.update({
                       where: {
                           email_type: {
                               email,
                               type: "PASSWORD_RESET",
                           },
                       },
                       data: {
                           otp,
                           createdAt: indianTime,
                           expiresAt,
                       },
                   });
                   await this.otpService.sendOTPEmail(email, otp);
                   return { success: true, message: 'OTP resent successfully', user: this.sanitizeUser(user), isVerified: true };
               } else {
                   return { success: true, message: 'An OTP has already been sent to your email. Please check your inbox.', user: this.sanitizeUser(user), isVerified: true };
               }
           }

           await this.prisma.oTP.create({
               data: {
                   email,
                   otp,
                   type: "PASSWORD_RESET",
                   createdAt: indianTime,
                   expiresAt,
               },
           });

           await this.otpService.sendOTPEmail(email, otp);
           return { success: true, message: 'OTP sent to your email', user: this.sanitizeUser(user), isVerified: true };

       } catch (error) {
           return { success: false, message: 'An unexpected error occurred. Please try again.', user: null, isVerified: false };
       }
   }

   async resendForgotPasswordOTP(email: string) {
       try {
           const result = await this.forgotPassword(email);
           return result;
       } catch (error) {
           return { success: false, message: 'Failed to resend OTP. Please try again later.' };
       }
   }

   async changePassword(email: string, password: string) {
       try {
           const user = await this.prisma.user.findUnique({ where: { email } });
           if (!user) {
               return { success: false, message: 'User not found', user: null };
           }

           const hashedPassword = await bcrypt.hash(password, 10);
           await this.prisma.user.update({
               where: { email },
               data: { password: hashedPassword }
           });

           return { success: true, message: 'Password changed successfully', user: this.sanitizeUser(user) };
       } catch (error) {
           return { success: false, message: 'An unexpected error occurred. Please try again.', user: null };
       }
   }

   async handleGoogleAuth(code: string) {
       try {
           const { tokens } = await this.googleClient.getToken(code);

           if (!tokens || !tokens.id_token) {
               throw new Error('Token exchange failed. Tokens are missing.');
           }

           this.googleClient.setCredentials(tokens);

           const ticket = await this.googleClient.verifyIdToken({
               idToken: tokens.id_token,
               audience: process.env.GOOGLE_CLIENT_ID,
           });

           const googleProfile = ticket.getPayload();
           if (!googleProfile) {
               throw new Error('Failed to retrieve Google profile.');
           }

           let user = await this.prisma.user.findUnique({
               where: { email: googleProfile.email },
           });

           if (!user) {
               user = await this.prisma.user.create({
                   data: {
                       email: googleProfile.email,
                       name: googleProfile.name,
                       createdAt: this.getIndianTime(),
                       updatedAt: this.getIndianTime(),
                       role: 'USER',
                       isVerified: true,
                       googleId: googleProfile.sub,
                   },
               });
           } else if (!user.googleId) {
               user = await this.prisma.user.update({
                   where: { id: user.id },
                   data: { googleId: googleProfile.sub },
               });
           }

           const payload = { sub: user.id, email: user.email };
           const accessToken = this.jwtService.sign(payload);

           return {
               success: true,
               type: "login",
               message: 'Login successful',
               user: this.sanitizeUser(user),
               accessToken,
           };

       } catch (error) {
           return {
               success: false,
               type: "login",
              data: error,
               message: 'An error occurred during Google authentication. Please try again.',
               user: null,
               accessToken: null
           };
       }
   }

   async validateToken(user: any) {
       try {
           const userId = user.sub || user.id || user.userId;
           
           if (!userId) {
               throw new Error('User ID not found in token payload');
           }

           const currentUser = await this.prisma.user.findUnique({ 
               where: { id: userId } 
           });

           if (!currentUser) {
               throw new Error('User not found');
           }

           if (!currentUser.isVerified) {
               throw new Error('User account is not verified');
           }

           return {
               valid: true,
               user_id: currentUser.id,
               role: currentUser.role.toLowerCase()
           };
       } catch (error) {
           throw new Error('Token validation failed: ' + error.message);
       }
   }
}
