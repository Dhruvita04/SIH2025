import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductService } from 'src/product/product.service';
import { CategoryService } from 'src/category/category.service';
import { BrandService } from 'src/brand/brand.service';
import { CommonController } from './common.controller';
import { ImageService } from 'src/utils/image.service';

@Module({
  imports: [],
  controllers: [CommonController],
  providers: [CommonService, PrismaService,ImageService, ProductService, CategoryService, BrandService],
  exports: [CommonService], // Export if other modules need it
})
export class CommonModule {}
