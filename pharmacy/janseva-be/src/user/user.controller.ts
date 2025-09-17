// src/user/user.controller.ts
import { Controller, Get, UseGuards, Param, Query } from "@nestjs/common"
import { JwtAuthGuard } from "../auth/jwt-auth.guard"
import { UserService } from "./user.service"

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ) {
    const pageNum = Number.parseInt(page || '1', 10) || 1
    const limitNum = Number.parseInt(limit || '10', 10) || 10

    const data = await this.userService.findAll(pageNum, limitNum, search || '')
    return {
      status: "success",
      message: "Users retrieved successfully",
      data,
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(":userId/orders")
  async getUserOrders(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ) {
    const pageNum = Number.parseInt(page || '1', 10) || 1
    const limitNum = Number.parseInt(limit || '10', 10) || 10

    const data = await this.userService.findUserOrders(userId, pageNum, limitNum, search || '')
    return {
      status: "success",
      message: "User orders retrieved successfully",
      data,
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async getOne(@Param('id') id: string) {
    const data = await this.userService.findOne(id)
    return {
      status: "success",
      message: "User retrieved successfully",
      data,
    }
  }
}
