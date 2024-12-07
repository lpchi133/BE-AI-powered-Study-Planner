import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Express } from 'express';
import cloudinary from '../cloudinary/cloudinary.config';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.users.findUnique({ where: { email } });
  }

  async createUser(data: { email: string; name: string; password: string }) {
    return this.prisma.users.create({ data });
  }

  async getUserProfile(userId: number) {
    return this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        profilePicture: true,
      },
    });
  }

  async updateProfilePicture(userId: number, file: Express.Multer.File): Promise<{ success: boolean, profilePictureUrl?: string }> {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'profile_pictures',
        public_id: `${userId}_${Date.now()}`,
      });
  
      const profilePictureUrl = result.secure_url;
  
      await this.prisma.users.update({
        where: { id: userId },
        data: { profilePicture: profilePictureUrl },
      });
  
      return { success: true, profilePictureUrl };
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      return { success: false };
    }
  }
}