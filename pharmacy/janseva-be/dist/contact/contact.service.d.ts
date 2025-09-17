import { PrismaService } from "../prisma/prisma.service";
import { CreateContactDto } from "./dto/create-contact.dto";
export declare class ContactService {
    private prisma;
    constructor(prisma: PrismaService);
    createContact(dto: CreateContactDto, currentObjectName: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        message: string;
        phoneNumber: string;
    }>;
    getAllContacts(currentObjectName: string): Promise<{
        createdAt: string;
        name: string;
        id: string;
        message: string;
        phoneNumber: string;
    }[]>;
}
