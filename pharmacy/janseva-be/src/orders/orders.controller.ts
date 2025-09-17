import { Body, Controller, Get, Param, Post, Query, Put, UseGuards, Req } from "@nestjs/common"
import { OrdersService } from "./orders.service"
import { CreateOrderDto } from "./dto/CreateOrderDto.dto"
import { JwtAuthGuard } from "src/auth/jwt-auth.guard"
import { RolesGuard } from "src/auth/roles.guard"
import { Roles } from "src/auth/roles.decorator"
import { Role } from "@prisma/client"
import { UpdateOrderStatusDto } from "./dto/UpdateOrderStatusDto.dto"
import { UpdateOrderStatusWithBatchesDto } from "./dto/UpdateOrderStatusWithBatchesDto.dto"
import { AddBatchesToOrderDto } from "./dto/AddBatchesToOrderDto.dto"
import { UpdateBatchesDto } from "./dto/UpdateBatchesDto.dto"
import { BatchSuggestionsDto } from "./dto/BatchSuggestionsDto.dto"

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get("user")
  @UseGuards(JwtAuthGuard)
  async getUserOrders(
    @Req() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
  ) {
    try {
      const userId = req.user.id
      const pageNum = Number.parseInt(page.toString(), 10) || 1
      const limitNum = Number.parseInt(limit, 10) || 10
      const orders = await this.ordersService.getUserOrders(userId, pageNum, limitNum, status)
      return { status: "success", message: "Orders fetched successfully", data: orders }
    } catch (error) {
      return { status: "error", message: error.message || "An error occurred while fetching orders", data: null }
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrder(@Body() order: CreateOrderDto) {
    try {
      const result = await this.ordersService.createOrder(order);
      return { 
        status: "success", 
        message: result.message || 'Order created successfully with PAYMENT_PENDING status', 
        data: {
          orderId: result.id,
          orderNumber: result.orderId,
          status: result.status,
          orderTotal: result.orderTotal
        }
      };
    } catch (error) {
      return { 
        status: "error", 
        message: error.message || 'An error occurred during order creation', 
        data: null 
      };
    }
  }

  @Get('status/:id')
  @UseGuards(JwtAuthGuard)
  async getOrders(@Param('id') id: string) {
    const orders = await this.ordersService.getOrderStatus(id);
    return { status: "success", message: 'Orders fetched successfully', data: orders };
  }

  @Get("admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAllOrders(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    try {
      const pageNum = Number.parseInt(page.toString(), 10) || 1
      const limitNum = Number.parseInt(limit.toString(), 10) || 10
      const result = await this.ordersService.getAllOrders(pageNum, limitNum, search, status, fromDate, toDate)
      return { status: "success", message: "Orders fetched successfully", data: result }
    } catch (error) {
      return { status: "error", message: error.message || "An error occurred while fetching orders", data: null }
    }
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getOrderDetails(@Param('id') id: string) {
    try {
      const result = await this.ordersService.getOrderDetails(id);
      return { status: "success", message: 'Order details fetched successfully', data: result };
    } catch (error) {
      return { status: "error", message: error.message || 'An error occurred while fetching order details', data: null };
    }
  }

  @Post("admin/:id/batches")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async addBatchesToOrder(@Param('id') id: string, @Body() addBatchesDto: AddBatchesToOrderDto) {
    try {
      const result = await this.ordersService.addBatchesToOrder(id, addBatchesDto.shippedBatches)
      return { status: "success", message: "Batches added to order successfully", data: result }
    } catch (error) {
      return { status: "error", message: error.message || "An error occurred while adding batches", data: null }
    }
  }

  @Put("admin/:id/batches")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateOrderBatches(@Param('id') id: string, @Body() updateBatchesDto: UpdateBatchesDto) {
    try {
      const result = await this.ordersService.updateOrderBatches(id, updateBatchesDto.shippedBatches)
      return { status: "success", message: "Order batches updated successfully", data: result }
    } catch (error) {
      return { status: "error", message: error.message || "An error occurred while updating batches", data: null }
    }
  }

  @Put("admin/:id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateOrderStatus(@Param('id') id: string, @Body() updateDto: UpdateOrderStatusWithBatchesDto) {
    try {
      const updatedOrder = await this.ordersService.updateOrderStatusWithBatches(id, updateDto.status, {
        trackingURL: updateDto.trackingURL,
        trackingNumber: updateDto.trackingNumber,
        courierName: updateDto.courierName,
        shippedBatches: updateDto.shippedBatches,
      })
      return { status: "success", message: "Order status updated successfully", data: updatedOrder }
    } catch (error) {
      return { status: "error", message: error.message || "An error occurred while updating order status", data: null }
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOrderDetailsByUser(@Param('id') id: string) {
    try {
      const result = await this.ordersService.getOrderDetails(id);
      return { status: "success", message: 'Order details fetched successfully', data: result };
    } catch (error) {
      return { status: "error", message: error.message || 'An error occurred while fetching order details', data: null };
    }
  }

  @Post("admin/batch-suggestions")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getBatchSuggestions( @Body() body: BatchSuggestionsDto) {
    try {
      const result = await this.ordersService.getBatchSuggestions(body.productId, body.variantId, body.batchNo)
      return { status: "success", message: "Batch suggestions fetched successfully", data: result }
    } catch (error) {
      return { status: "error", message: error.message || "An error occurred while fetching batch suggestions", data: null }
    }
  }
}
