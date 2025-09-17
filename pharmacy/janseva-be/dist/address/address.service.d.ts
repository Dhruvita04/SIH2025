import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
export declare class AddressService {
    private prisma;
    constructor(prisma: PrismaService);
    createAddress(dto: CreateAddressDto, currentObjectName: string): Promise<{
        default: boolean;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        userId: string | null;
        line1: string;
        line2: string | null;
        city: string;
        state: string;
        postalCode: string;
    }>;
    getAddressById(userId: string, currentObjectName: string): Promise<{
        default: boolean;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        userId: string | null;
        line1: string;
        line2: string | null;
        city: string;
        state: string;
        postalCode: string;
    }[]>;
    updateAddress(id: string, dto: UpdateAddressDto, currentObjectName: string): Promise<{
        default: boolean;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        userId: string | null;
        line1: string;
        line2: string | null;
        city: string;
        state: string;
        postalCode: string;
    }>;
    deleteAddress(id: string, currentObjectName: string): Promise<any>;
    setDefaultAddress(id: string, userId: string, currentObjectName: string): Promise<{
        default: boolean;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        userId: string | null;
        line1: string;
        line2: string | null;
        city: string;
        state: string;
        postalCode: string;
    }>;
}
