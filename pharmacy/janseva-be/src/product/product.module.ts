import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ImageService } from '../utils/image.service';

@Module({
  imports: [],
  controllers: [ProductController],
  providers: [ProductService, PrismaService, ImageService],
  exports: [ProductService], // Export if other modules need it
})
export class ProductModule {}
