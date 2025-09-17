import { Module } from "@nestjs/common"
import { PaymentsController } from "./payments.controller"
import { PaymentsService } from "./payments.service"
import { PrismaService } from "src/prisma/prisma.service"
import { OrdersModule } from "src/orders/orders.module"
import { AuthModule } from "src/auth/auth.module"

@Module({
  imports: [OrdersModule, AuthModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PrismaService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
