import { Module } from "@nestjs/common"
import { OrdersController } from "./orders.controller"
import { OrdersService } from "./orders.service"
import { PrismaService } from "src/prisma/prisma.service"
import { PdfService } from "src/utils/pdf.service"
import { AuthModule } from "src/auth/auth.module"
import { ImageService } from "src/utils/image.service"

@Module({
  imports: [AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService, PdfService, ImageService],
  exports: [OrdersService],
})
export class OrdersModule {}
