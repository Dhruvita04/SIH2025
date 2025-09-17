import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ImageService } from '../utils/image.service';

@Module({
  imports: [],
  controllers: [BrandController],
  providers: [BrandService, PrismaService, ImageService],
  exports: [BrandService], // Export if other modules need it
})
export class BrandModule {}
