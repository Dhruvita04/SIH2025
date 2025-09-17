import { ContactService } from "./contact.service";
import { CreateContactDto } from "./dto/create-contact.dto";
export declare class ContactController {
    private readonly contactService;
    private currentObjectName;
    constructor(contactService: ContactService);
    create(dto: CreateContactDto): Promise<{
        status: string;
        message: string;
        data: {
            name: string;
            id: string;
            createdAt: Date;
            message: string;
            phoneNumber: string;
        };
    } | {
        status: string;
        message: any;
        data: any;
    }>;
    getAll(): Promise<{
        status: string;
        message: string;
        data: {
            createdAt: string;
            name: string;
            id: string;
            message: string;
            phoneNumber: string;
        }[];
    } | {
        status: string;
        message: any;
        data: any;
    }>;
}
