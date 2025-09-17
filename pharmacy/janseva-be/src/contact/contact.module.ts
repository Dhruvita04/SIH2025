import { Module } from "@nestjs/common"
import { ContactService } from "./contact.service"
import { ContactController } from "./contact.controller"
import { PrismaService } from "../prisma/prisma.service"

@Module({
  imports: [],
  controllers: [ContactController],
  providers: [ContactService, PrismaService],
  exports: [ContactService], // Export if other modules need it
})
export class ContactModule {}
