import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [AddressController],
  providers: [AddressService, PrismaService],
  exports: [AddressService], // Export if other modules need it
})
export class AddressModule {}
