import { Controller, Get, Post, Put, Body, Param, UploadedFile, UseInterceptors, UseGuards, Query } from "@nestjs/common"
import { PrescriptionService } from "./prescription.service"
import { CreatePrescriptionDto } from "./dto/create-prescription.dto"
import { FileInterceptor } from "@nestjs/platform-express"
import { Multer } from "multer"
import { JwtAuthGuard } from "../auth/jwt-auth.guard"
import { CreatePrescriptionOrderDto } from "./dto/create-prescription-order.dto"
import { AddPrescriptionOrderToCartDto } from "./dto/order-to-cart.dto"
import { CreateOrderWithPrescriptionDto } from "./dto/create-order-with-prescription.dto"
import { UpdatePrescriptionOrderStatusDto } from "./dto/update-prescription-order-status.dto"

@Controller("prescription")
export class PrescriptionController {
  private currentObjectName: string

  constructor(private readonly prescriptionService: PrescriptionService) {
    this.currentObjectName = "Prescription"
  }

  @UseGuards(JwtAuthGuard)
  @Post("upload")
  @UseInterceptors(FileInterceptor("prescription"))
  async create(@Body() dto: CreatePrescriptionDto, @UploadedFile() file: Multer.File) {
    try {
      if (!file) {
        throw new Error("No file uploaded")
      }
      const response = await this.prescriptionService.createPrescription(dto, file, this.currentObjectName)
      return {
        status: "success",
        message: "Prescription created successfully",
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
  async getAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('status') status?: string
  ) {
    try {
      const pageNum = parseInt(page, 10) || 1
      const limitNum = parseInt(limit, 10) || 10
      
      const result = await this.prescriptionService.getAllPrescriptions(pageNum, limitNum, search, status)
      return {
        status: "success",
        message: "Prescriptions retrieved successfully",
        data: result,
      }
    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      }
    }
  }

  // Add direct route for getting prescription by ID (this was missing!))
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string) {
    try {
      const prescription = await this.prescriptionService.getPrescriptionById(id, this.currentObjectName);
      return {
        status: 'success',
        message: 'Prescription retrieved successfully',
        data: prescription
      };
    } catch (error) {
      // Handle specific JWT expiration error
      if (error.message && error.message.includes('exp')) {
        return {
          status: 'error',
          message: 'Prescription image link has expired. Please refresh the page.',
          data: null,
          errorCode: 'JWT_EXPIRED'
        };
      }
      return {
        status: 'error',
        message: error.message,
        data: null
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('order-status/:orderId')
  async getOrderStatus(@Param('orderId') orderId: string) {
    try {
      const prescription = await this.prescriptionService.getPrescriptionOrderFromPrescriptionId(orderId, this.currentObjectName);
      return {
        status: 'success',
        message: 'Prescription Order retrieved successfully',
        data: prescription
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        data: null
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('order-status/:orderId')
  async updateOrderStatus(@Param('orderId') orderId: string, @Body() dto: UpdatePrescriptionOrderStatusDto) {
    try {
      const updatedOrder = await this.prescriptionService.updatePrescriptionOrderStatus(orderId, dto)
      return {
        status: "success",
        message: "Prescription order status updated successfully",
        data: updatedOrder,
      }
    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      }
    }
  }

  // get a single prescription (keeping the existing route for backward compatibility)
  @UseGuards(JwtAuthGuard)
  @Get('single/:id')
  async getSingleById(@Param('id') id: string) {
    try {
      const prescription = await this.prescriptionService.getPrescriptionById(id, this.currentObjectName);
      return {
        status: 'success',
        message: 'Prescription retrieved successfully',
        data: prescription
      };
    } catch (error) {
      // Handle specific JWT expiration error
      if (error.message && error.message.includes('exp')) {
        return {
          status: 'error',
          message: 'Prescription image link has expired. Please refresh the page.',
          data: null,
          errorCode: 'JWT_EXPIRED'
        };
      }
      return {
        status: 'error',
        message: error.message,
        data: null
      };
    }
  }

  // get all prescriptions for a user with pagination and order filter
  @UseGuards(JwtAuthGuard)
  @Get('user/:id')
  async getByUserId(
    @Param('id') id: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('order') order: string = 'false'
  ) {
    try {
      const pageNum = parseInt(page, 10) || 1
      const limitNum = parseInt(limit, 10) || 10
      const orderOnly = order === 'true'
      
      const result = await this.prescriptionService.getPrescriptionByUserId(
        id, 
        this.currentObjectName, 
        pageNum, 
        limitNum, 
        orderOnly
      );
      return {
        status: 'success',
        message: 'Prescriptions retrieved successfully',
        data: result
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        data: null
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post("order-status/:id")
  async createOrder(@Param('id') id: string, @Body() dto: CreatePrescriptionOrderDto) {
    try {
      const prescriptionOrder = await this.prescriptionService.createPrescriptionOrder(id, dto)
      return {
        status: "success",
        message: "Prescription order created successfully",
        data: prescriptionOrder,
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
  @Post("create-order")
  async createOrderWithPrescription(@Body() dto: CreateOrderWithPrescriptionDto) {
    try {
      const prescriptionOrder = await this.prescriptionService.createOrderWithPrescription(dto.userId, dto.prescriptionId)
      return {
        status: "success",
        message: "Prescription order created successfully",
        data: prescriptionOrder,
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
  @Post("order/:id")
  async addOrderToCart(@Param('id') prescriptionOrderId: string, @Body() dto: AddPrescriptionOrderToCartDto) {
    try {
      const prescriptionOrder = await this.prescriptionService.addPrescriptionOrderToCart(prescriptionOrderId, dto)
      return {
        status: "success",
        message: "Prescription order retrieved successfully",
        data: prescriptionOrder,
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