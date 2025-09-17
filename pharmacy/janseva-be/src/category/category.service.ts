import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ImageService } from '../utils/image.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Multer } from 'multer';

@Injectable()
export class CategoryService {
  constructor(
    private prisma: PrismaService,
    private imageService: ImageService,
  ) { }

  async createCategory(dto: CreateCategoryDto, file: Multer.File) {

    // Check if a category with the same name already exists
    const existingCategory = await this.prisma.category.findUnique({
      where: { name: dto.name },
    });

    if (existingCategory) {
      throw new ConflictException('A category with this name already exists');
    }

    const logoUrl = await this.imageService.uploadImage('categories', `${this.getImageName(dto.name)}`, file.mimetype.toString(), file.buffer);

    return this.prisma.category.create({
      data: {
        ...dto,
        logoUrl,
        createdBy: 'system', // Add a default value for createdBy
        updatedBy: 'system', // Add a default value for updatedBy
      },
    });
  }

  async getAllCategories() {
    return this.prisma.category.findMany();
  }

  async getPublicCategories(limit: number, offset: number) {
    
    try {
      // get the total count of brands
      const totalCount = await this.prisma.category.count();

      const categories = await this.prisma.category.findMany({
        take: limit,
        skip: offset
      });

      return {
        data: categories,
        totalCount
      };

    } catch (error) {
      throw new NotFoundException(`Error in getting Categories`);
    }
  }

  async getCategoryById(id: string, currentObjectName: string) {
    try {
      const category = await this.prisma.category.findUnique({ where: { id } });
      if (!category) throw new NotFoundException(`${currentObjectName} not found`);

      let logoFile = null;
      if (category.logoUrl) {
        try {
          logoFile = await this.imageService.getImageFileFromUrl('categories', category.logoUrl);
        } catch (error) {
          console.error('Error getting logo file:', error);
          // Continue without the file if there's an error
        }
      }

      return {
        id: category.id,
        name: category.name,
        description: category.description,
        logo: category.logoUrl ? {
          url: category.logoUrl,
          path: this.imageService.getImagePathFromUrl(category.logoUrl),
          file: logoFile || null
        } : null
      };
    } catch (error) {
      throw new NotFoundException(`Error in getting ${currentObjectName}`);
    }
    // const category = await this.prisma.category.findUnique({ where: { id } });
    // if (!category) throw new NotFoundException('Category not found');
    // return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto, file?: Multer.File) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    let logoUrl = category.logoUrl;

    // If a new file is provided, upload the new image and delete the old one
    if (file) {
      const newLogoUrl = await this.imageService.uploadImage(
        'categories',
        `${this.getImageName(dto.name)}`,
        file.mimetype.toString(),
        file.buffer,
      );

      // Delete old image if it exists
      if (category.logoUrl) {
        const oldPath = this.imageService.getImagePathFromUrl(category.logoUrl);
        await this.imageService.deleteImage('categories', oldPath);
      }

      logoUrl = newLogoUrl;
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...dto,
        logoUrl,
        updatedBy: 'system', // Add a default value for updatedBy
      },
    });
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    if (category.logoUrl) {
      const path = this.imageService.getImagePathFromUrl(category.logoUrl);
      await this.imageService.deleteImage('categories', path);
    }

    return this.prisma.category.delete({ where: { id } });
  }

  async deleteMultipleCategories(ids: string[], currentObjectNamePlural: string) {
    // First get all categories that will be deleted
    const categories = await this.prisma.category.findMany({
      where: { id: { in: ids } }
    });

    if (categories.length === 0) throw new NotFoundException(`${currentObjectNamePlural} not found`);

    // Delete the images first
    for (const category of categories) {
      if (category.logoUrl) {
        const path = this.imageService.getImagePathFromUrl(category.logoUrl);
        await this.imageService.deleteImage('categories', path);
      }
    }

    // Then delete all the category records
    const deletedCategories = await this.prisma.category.deleteMany({
      where: { id: { in: ids } }
    });

    return deletedCategories;
  }

  getImageName(name: string) {
    return name.toLowerCase().replace(/ /g, '_');
  }

}
