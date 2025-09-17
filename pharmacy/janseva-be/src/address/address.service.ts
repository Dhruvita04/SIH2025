import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {


  constructor(
    private prisma: PrismaService
  ) {

  }

  async createAddress(dto: CreateAddressDto, currentObjectName: string) {
    try {
      //get count of address for user
      const count = await this.prisma.address.count({
        where: {
          userId: dto.userId
        }
      });

      // if the count is 5 then set default to true
      if (count === 5) {
        throw new ConflictException('You have reached the maximum limit of 5 addresses');
      }

      // If this address is default, set all other addresses for this user to non-default
      if (dto.default) {
        await this.prisma.address.updateMany({
          where: {
            userId: dto.userId,
            default: true
          },
          data: {
            default: false
          }
        });
      }

      return this.prisma.address.create({
        data: {
          userId: dto.userId,
          name: dto.name,
          phone: dto.phone,
          line1: dto.line1,
          line2: dto.line2 || '',
          city: dto.city,
          state: dto.state,
          postalCode: dto.postalCode,
          default: dto.default
        },
      });
    } catch (error) {
      throw new NotFoundException(`Error in creating ${currentObjectName}`);
    }
  }

  async getAddressById(userId: string, currentObjectName: string) {
    try {
      const address = await this.prisma.address.findMany({ where: { userId } });
      if (!address) throw new NotFoundException(`${currentObjectName} not found`);

      return address;

    } catch (error) {
      throw new NotFoundException(`Error in getting ${currentObjectName}`);
    }
  }

  async updateAddress(id: string, dto: UpdateAddressDto, currentObjectName: string) {

    try {
      const address = await this.prisma.address.findUnique({ where: { id } });
      if (!address) throw new NotFoundException(`${currentObjectName} not found`);

      // if the address is default then make all other address default to false
      if (dto.default) {
        await this.prisma.address.updateMany({ where: { userId: address.userId, default: true }, data: { default: false } });
      }

      return this.prisma.address.update({
        where: { id },
        data: {
          name: dto.name,
          phone: dto.phone,
          line1: dto.line1,
          line2: dto.line2 || '',
          city: dto.city,
          state: dto.state,
          postalCode: dto.postalCode,
          default: dto.default
        },
      });

    } catch (error) {
      throw new NotFoundException(`Error in updating ${currentObjectName}`);
    }

  }

  async deleteAddress(id: string, currentObjectName: string) {
    try {
      const address = await this.prisma.address.findUnique({ where: { id } });
      if (!address) throw new NotFoundException(`${currentObjectName} not found`);

      // Then delete the brand record
      await this.prisma.address.delete({ where: { id } });

      return null;

    } catch (error) {
      throw new NotFoundException(`Error in deleting ${currentObjectName}`);
    }
  }

  async setDefaultAddress(id: string, userId: string, currentObjectName: string) {
    try {
      const address = await this.prisma.address.findUnique({ where: { id } });
      if (!address) throw new NotFoundException(`${currentObjectName} not found`);

      // make all other address default to false
      await this.prisma.address.updateMany({ where: { userId, default: true }, data: { default: false } });

      return this.prisma.address.update({
        where: { id },
        data: { default: true }
      });
    } catch (error) {
      throw new NotFoundException(`Error in setting default ${currentObjectName}`);
    }
  }

}
