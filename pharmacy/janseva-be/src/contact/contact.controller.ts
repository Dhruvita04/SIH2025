import { Controller, Get, Post, Delete, Param, Body, UseGuards } from "@nestjs/common"
import  { ContactService } from "./contact.service"
import  { CreateContactDto } from "./dto/create-contact.dto"
import { JwtAuthGuard } from "../auth/jwt-auth.guard"

@Controller("contact")
export class ContactController {
  private currentObjectName: string

  constructor(private readonly contactService: ContactService) {
    this.currentObjectName = "Contact"
  }

  @Post()
  async create(@Body() dto: CreateContactDto) {
    try {
      const response = await this.contactService.createContact(dto, this.currentObjectName)
      return {
        status: "success",
        message: "Contact created successfully",
        data: response,
      }
    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    try {
      const contacts = await this.contactService.getAllContacts(this.currentObjectName)
      return {
        status: "success",
        message: "Contacts retrieved successfully",
        data: contacts,
      }
    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      }
    }
  }


}
