import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UploadedFile,
    UseInterceptors,
    Optional,
    UseGuards,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('address')
export class AddressController {

    private currentObjectName: string;

    constructor(private readonly addressService: AddressService) {
        this.currentObjectName = 'Address';
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(
        @Body() dto: CreateAddressDto,
    ) {
        try {
            const response = await this.addressService.createAddress(dto, this.currentObjectName);
            return {
                status: 'success',
                message: 'Address created successfully',
                data: response
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
    @Put('default/:id')
    async setDefaultAddress(@Param('id') id: string, @Body() dto: { userId: string }) {
        try {
            const address = await this.addressService.setDefaultAddress(id, dto.userId, this.currentObjectName);
            return {
                status: 'success',
                message: 'Address set as default successfully',
                data: address
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
    @Get(':userId')
    async getById(@Param('userId') userId: string) {
        try {
            const address = await this.addressService.getAddressById(userId, this.currentObjectName);
            return {
                status: 'success',
                message: 'Address retrieved successfully',
                data: address
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
    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateAddressDto,
    ) {
        try {
            const updatedAddress = await this.addressService.updateAddress(id, dto, this.currentObjectName);
            return {
                status: 'success',
                message: 'Address updated successfully',
                data: updatedAddress
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
    @Delete(':id')
    async delete(@Param('id') id: string) {
        try {
            await this.addressService.deleteAddress(id, this.currentObjectName);
            return {
                status: 'success',
                message: 'Address deleted successfully',
                data: null
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    }

}
