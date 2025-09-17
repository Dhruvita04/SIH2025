import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [CartController],
  providers: [CartService, PrismaService],
  exports: [CartService], // Export if other modules need it
})
export class CartModule {}
