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
    Query,
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('brands')
export class BrandController {

    private currentObjectName: string;

    constructor(private readonly brandService: BrandService) {
        this.currentObjectName = 'Company';
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    @UseInterceptors(FileInterceptor('logo'))
    async create(
        @Body() dto: CreateBrandDto,
        @UploadedFile() file: Multer.File,
    ) {
        try {
            if (!file) {
                throw new Error('No file uploaded');
            }
            const response = await this.brandService.createBrand(dto, file, this.currentObjectName);
            return {
                status: 'success',
                message: 'Brand created successfully',
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

    @Get('public')
    async getPublicBrands(@Query('limit') limit: number, @Query('offset') offset: number) {
        try {
            const brands = await this.brandService.getPublicBrands(limit, offset);
            return {
                status: 'success',
                message: 'Brands retrieved successfully',
                data: brands
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
    @Get()
    async getAll() {
        try {
            const brands = await this.brandService.getAllBrands();
            return {
                status: 'success',
                message: 'Brands retrieved successfully',
                data: brands
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
    @Get(':id')
    async getById(@Param('id') id: string) {
        try {
            const brand = await this.brandService.getBrandById(id, this.currentObjectName);
            return {
                status: 'success',
                message: 'Brand retrieved successfully',
                data: brand
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
    @UseInterceptors(FileInterceptor('logo'))
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateBrandDto,
        @Optional() @UploadedFile() file?: Multer.File,
    ) {
        try {
            const updatedBrand = await this.brandService.updateBrand(id, dto, this.currentObjectName, file);
            return {
                status: 'success',
                message: 'Brand updated successfully',
                data: updatedBrand
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
            await this.brandService.deleteBrand(id, this.currentObjectName);
            return {
                status: 'success',
                message: 'Brand deleted successfully',
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

    @UseGuards(JwtAuthGuard)
    @Delete()
    async deleteMultiple(@Body('ids') ids: string[]) {
        try {
            await this.brandService.deleteMultipleBrands(ids, this.currentObjectName);
            return {
                status: 'success',
                message: 'Brands deleted successfully',
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
