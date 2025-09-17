import { Module } from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import { PrescriptionController } from './prescription.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ImageService } from '../utils/image.service';

@Module({
  imports: [],
  controllers: [PrescriptionController],
  providers: [PrescriptionService, PrismaService, ImageService],
  exports: [PrescriptionService], // Export if other modules need it
})
export class PrescriptionModule {}
