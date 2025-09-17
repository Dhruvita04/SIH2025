import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
export declare class AddressController {
    private readonly addressService;
    private currentObjectName;
    constructor(addressService: AddressService);
    create(dto: CreateAddressDto): Promise<{
        status: string;
        message: string;
        data: {
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
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    setDefaultAddress(id: string, dto: {
        userId: string;
    }): Promise<{
        status: string;
        message: string;
        data: {
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
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    getById(userId: string): Promise<{
        status: string;
        message: string;
        data: {
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
        }[];
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    update(id: string, dto: UpdateAddressDto): Promise<{
        status: string;
        message: string;
        data: {
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
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    delete(id: string): Promise<{
        status: string;
        message: any;
        data: any;
    }>;
}
