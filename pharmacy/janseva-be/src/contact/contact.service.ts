import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateContactDto } from "./dto/create-contact.dto"

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async createContact(dto: CreateContactDto, currentObjectName: string) {
    try {
      return this.prisma.contact.create({
        data: {
          name: dto.name,
          phoneNumber: dto.phoneNumber,
          message: dto.message,
        },
      })
    } catch (error) {
      throw new NotFoundException(`Error in creating ${currentObjectName}`)
    }
  }

  async getAllContacts(currentObjectName: string) {
    try {
      const contacts = await this.prisma.contact.findMany({
        orderBy: {
          createdAt: "desc",
        },
      })
      return contacts.map((contact) => ({
        ...contact,
        createdAt: contact.createdAt.toISOString(), // Convert Date object to ISO string
      }))
    } catch (error) {
      throw new NotFoundException(`Error in getting ${currentObjectName}s`)
    }
  }
}
