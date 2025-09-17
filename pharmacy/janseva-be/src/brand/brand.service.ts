import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ImageService } from '../utils/image.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Multer } from 'multer';

@Injectable()
export class BrandService {


  constructor(
    private prisma: PrismaService,
    private imageService: ImageService,
  ) {

  }

  async createBrand(dto: CreateBrandDto, file: Multer.File, currentObjectName: string) {

    // Check if a brand with the same name already exists
    const existingBrand = await this.prisma.brand.findUnique({
      where: { name: dto.name },
    });

    if (existingBrand) {
      throw new ConflictException(`A ${currentObjectName} with this name already exists`);
    }

    const logoUrl = await this.imageService.uploadImage('brands', `${this.getImageName(dto.name)}`, file.mimetype.toString(), file.buffer);

    return this.prisma.brand.create({
      data: {
        ...dto,
        logoUrl,
        createdBy: 'system', // Add a default value for createdBy
        updatedBy: 'system', // Add a default value for updatedBy
      },
    });
  }

  async getPublicBrands(limit: number, offset: number) {

    try {
      // get the total count of brands
      const totalCount = await this.prisma.brand.count();

      const brands = await this.prisma.brand.findMany({
        take: limit,
        skip: offset
      });

      return {
        data: brands,
        totalCount
      };

    } catch (error) {
      throw new NotFoundException(`Error in getting Brands`);
    }
  }

  async getAllBrands() {
    return this.prisma.brand.findMany();
  }

  async getBrandById(id: string, currentObjectName: string) {
    try {
      const brand = await this.prisma.brand.findUnique({ where: { id } });
      if (!brand) throw new NotFoundException(`${currentObjectName} not found`);

      let logoFile = null;
      if (brand.logoUrl) {
        try {
          logoFile = await this.imageService.getImageFileFromUrl('brands', brand.logoUrl);
        } catch (error) {
          console.error('Error getting logo file:', error);
          // Continue without the file if there's an error
        }
      }

      return {
        id: brand.id,
        name: brand.name,
        description: brand.description,
        logo: brand.logoUrl ? {
          url: brand.logoUrl,
          path: this.imageService.getImagePathFromUrl(brand.logoUrl),
          file: logoFile || null
        } : null
      };
    } catch (error) {
      throw new NotFoundException(`Error in getting ${currentObjectName}`);
    }
  }

  async updateBrand(id: string, dto: UpdateBrandDto, currentObjectName: string, file?: Multer.File) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException(`${currentObjectName} not found`);

    let logoUrl = brand.logoUrl;

    // If a new file is provided, upload the new image and delete the old one
    if (file) {
      const newLogoUrl = await this.imageService.uploadImage(
        'brands',
        `${this.getImageName(dto.name)}`,
        file.mimetype.toString(),
        file.buffer,
      );

      // Delete old image if it exists
      if (brand.logoUrl) {
        const oldPath = this.imageService.getImagePathFromUrl(brand.logoUrl);
        await this.imageService.deleteImage('brands', oldPath);
      }

      logoUrl = newLogoUrl;
    }

    return this.prisma.brand.update({
      where: { id },
      data: {
        ...dto,
        logoUrl,
        updatedBy: 'system', // Add a default value for updatedBy
      },
    });
  }

  async deleteBrand(id: string, currentObjectName: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException(`${currentObjectName} not found`);

    // Delete the image first
    if (brand.logoUrl) {
      const path = this.imageService.getImagePathFromUrl(brand.logoUrl);
      await this.imageService.deleteImage('brands', path);
    }

    // Then delete the brand record
    await this.prisma.brand.delete({ where: { id } });
  }

  async deleteMultipleBrands(ids: string[], currentObjectName: string) {
    // First get all brands that will be deleted
    const brands = await this.prisma.brand.findMany({
      where: { id: { in: ids } }
    });

    if (brands.length === 0) throw new NotFoundException(`${currentObjectName}s not found`);

    // Delete the images first
    for (const brand of brands) {
      if (brand.logoUrl) {
        const path = this.imageService.getImagePathFromUrl(brand.logoUrl);
        await this.imageService.deleteImage('brands', path);
      }
    }

    // Then delete all the brand records
    const deletedBrands = await this.prisma.brand.deleteMany({
      where: { id: { in: ids } }
    });

    return deletedBrands;
  }

  getImageName(name: string) {
    return name.toLowerCase().replace(/ /g, '_');
  }

}
