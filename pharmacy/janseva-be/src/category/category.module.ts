import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ImageService } from '../utils/image.service';

@Module({
  imports: [],
  controllers: [CategoryController],
  providers: [CategoryService, PrismaService, ImageService],
  exports: [CategoryService], // Export if other modules need it
})
export class CategoryModule {}
