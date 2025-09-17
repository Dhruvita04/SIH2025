import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ImageService } from '../utils/image.service';
import { ProfileDto } from './dto/profile.dto';
import { Multer } from 'multer';


@Injectable()
export class ProfileService {


  constructor(
    private prisma: PrismaService,
    private imageService: ImageService,
  ) {

  }


  async getProfile(userId: string) {
    try {
      const profile = await this.prisma.userProfile.findUnique({
        where: {
          userId: userId
        }
      });

      if (profile?.profileImageUrl) {
        profile.profileImageUrl = await this.imageService.getSignedUrl('profiles', profile.profileImageUrl, parseInt(process.env.SIGNED_URL_DURATION_IN_MINUTES || '60'));
      }

      return profile;
    } catch (error) {
      throw new NotFoundException('Profile not found');
    }
  }

  async handleProfile(userId: string, dto: ProfileDto, file?: Multer.File) {
    try {

      let profileImageUrl = null;

      if (file) {
        profileImageUrl = await this.imageService.uploadImage('profiles', `${userId}`, file.mimetype.toString(), file.buffer);
      }

      //check if profile already exists
      const profile = await this.prisma.userProfile.findUnique({
        where: { userId }
      });

      if (!profile) {
        const newProfile = await this.prisma.userProfile.create({
          data: {
            firstName: dto.firstName || '',
            lastName: dto.lastName || '',
            age: parseInt(dto.age.toString()) || 0,
            gender: dto.gender || '',
            phone: dto.phone || '',
            profileImageUrl: profileImageUrl || '',
            userId
          }
        });
        return newProfile;
      }

      //update profile
      const updatedProfile = await this.prisma.userProfile.update({
        where: { userId },
        data: {
          firstName: dto.firstName || '',
          lastName: dto.lastName || '',
          age: parseInt(dto.age.toString()) || 0,
          gender: dto.gender || '',
          phone: dto.phone || '',
          profileImageUrl: profileImageUrl || '',
        }
      });

      return updatedProfile;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Profile not found');
    }
  }


  getImageName(name: string) {
    return name.toLowerCase().replace(/ /g, '_');
  }

}
