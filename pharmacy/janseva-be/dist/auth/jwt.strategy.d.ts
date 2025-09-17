import { Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: any): Promise<{
        name: string | null;
        id: string;
        email: string;
        googleId: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        isVerified: boolean;
        role: import(".prisma/client").$Enums.Role;
    }>;
}
export {};
