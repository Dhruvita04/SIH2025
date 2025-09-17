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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('categories')
export class CategoryController {

    private currentObjectName: string;
    private currentObjectNamePlural: string;

    constructor(private readonly categoryService: CategoryService) {
        this.currentObjectName = 'Category';
        this.currentObjectNamePlural = 'Categories';
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    @UseInterceptors(FileInterceptor('logo'))
    async create(
        @Body() dto: CreateCategoryDto,
        @UploadedFile() file: Multer.File,
    ) {
        try {
            if (!file) {
                throw new Error('No file uploaded');
            }
            const response = await this.categoryService.createCategory(dto, file);
            return {
                status: 'success',
                message: `${this.currentObjectName} created successfully`,
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
    async getPublicCategories(@Query('limit') limit: number, @Query('offset') offset: number) {
        try {
            const categories = await this.categoryService.getPublicCategories(limit, offset);
            return {
                status: 'success',
                message: 'Categories retrieved successfully',
                data: categories
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
            const categories = await this.categoryService.getAllCategories();
            return {
                status: 'success',
                message: `${this.currentObjectNamePlural} retrieved successfully`,
                data: categories
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
            const category = await this.categoryService.getCategoryById(id, this.currentObjectName);
            return {
                status: 'success',
                message: `${this.currentObjectName} retrieved successfully`,
                data: category
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
        @Body() dto: UpdateCategoryDto,
        @Optional() @UploadedFile() file?: Multer.File,
    ) {
        try {
            const updatedCategory = await this.categoryService.updateCategory(id, dto, file);
            return {
                status: 'success',
                message: `${this.currentObjectName} updated successfully`,
                data: updatedCategory
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
            await this.categoryService.deleteCategory(id);
            return {
                status: 'success',
                message: `${this.currentObjectName} deleted successfully`,
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
            await this.categoryService.deleteMultipleCategories(ids, this.currentObjectNamePlural);
            return {
                status: 'success',
                message: `${this.currentObjectNamePlural} deleted successfully`,
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
