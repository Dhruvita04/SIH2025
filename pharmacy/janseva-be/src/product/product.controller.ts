import {
    Controller,
    Post,
    Body,
    UseGuards,
    Get,
    Delete,
    Param,
    Put,
    Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products')
export class ProductController {

    private currentObjectName: string;

    constructor(private readonly productService: ProductService) {
        this.currentObjectName = 'Product';
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() data: CreateProductDto) {
        try {


            // if (!data.productImages || data.productImages.length === 0) {
            //     throw new Error('No product images uploaded');
            // }

            // create the product
            const response = await this.productService.createProduct(
                data,
                this.currentObjectName,
            );

            return {
                status: 'success',
                message: 'Product created successfully',
                data: response,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 'error',
                message: error.message,
                data: null,
            };
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('scrape')
    async scrapeProduct(@Body() data: { medicineName: string }) {

        if (!data.medicineName) {
            return {
                status: 'error',
                message: 'Medicine name is required',
                data: null
            };
        }

        const result = await this.productService.scrapeDetails(data.medicineName);
        return result;
    }

    @Get()
    async getAll(@Query('page') page?: number, @Query('limit') limit?: number, @Query('search') search?: string) {
        try {
            const products = await this.productService.getAllProducts(page, limit, search);
            return {
                status: 'success',
                message: 'Products retrieved successfully',
                data: products
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
            await this.productService.deleteProduct(id);
            return {
                status: 'success',
                message: 'Product deleted successfully',
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
            await this.productService.deleteMultipleProducts(ids, this.currentObjectName);
            return {
                status: 'success',
                message: 'Products deleted successfully',
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
    @Put(':slug')
    async update(
        @Param('slug') slug: string,
        @Body() dto: CreateProductDto
    ) {
        try {
            const updatedProduct = await this.productService.updateProduct(slug, dto, this.currentObjectName);
            return {
                status: 'success',
                message: 'Product updated successfully',
                data: updatedProduct
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    }

    
    @Get('/tags')
    async getTags(@Query('page') page?: number, @Query('limit') limit?: number, @Query('tags') tags?: string) {
        try {
            const tagsProducts = await this.productService.getTagsProducts(page, limit, tags);
            return {
                status: 'success',
                message: 'Products retrieved successfully',
                data: tagsProducts
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    }


    @Get("/tags/suggestions")
  async getTagsSuggestions(@Query('search') search?: string, @Query('limit') limit?: string) {
    try {
      const limitNum = limit ? Number.parseInt(limit, 10) : undefined
      const suggestions = await this.productService.getTagsSuggestions(search, limitNum)
      return {
        status: "success",
        message: "Tags suggestions retrieved successfully",
        data: suggestions,
      }
    } catch (error) {
      return {
        status: "error",
        message: error.message,
        data: null,
      }
    }
  }
    
    // @UseGuards(JwtAuthGuard)
    @Get(':slug')
    async getBySlug(@Param('slug') slug: string) {
        try {
            const product = await this.productService.getProductBySlug(slug);
            return {
                status: 'success',
                message: 'Product retrieved successfully',
                data: product
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
