import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ImageService } from '../utils/image.service';

@Module({
  imports: [],
  controllers: [ProfileController],
  providers: [ProfileService, PrismaService, ImageService],
  exports: [ProfileService], // Export if other modules need it
})
export class ProfileModule {}
