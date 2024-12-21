import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Express } from 'express';
import cloudinary from '../cloudinary/cloudinary.config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.users.findUnique({ where: { email } });
  }

  async createUser(data: { email: string; name: string; password: string; checkAccountGG: string }) {
    return this.prisma.users.create({ data });
  }

  async getUserProfile(userId: number) {
    return this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        checkAccountGG: true,
      },
    });
  }

  async updateProfilePicture(userId: number, file: Express.Multer.File): Promise<{ success: boolean, profilePictureUrl?: string }> {
    try {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'profile_pictures',
            public_id: `${userId}_${Date.now()}`,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(file.buffer);
      });
  
      const profilePictureUrl = (result as any).secure_url;
  
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

  async updateUser(userId: number, data: { name?: string; email?: string }): Promise<{ success: boolean }> {
    try {
      await this.prisma.users.update({
        where: { id: userId },
        data,
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating user data:', error);
      return { success: false };
    }
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{ success: boolean, message?: string }> {
    try {
      const user = await this.prisma.users.findUnique({ where: { id: userId } });
  
      if (!user) {
        return { success: false, message: 'User not found' };
      }
  
      if (user.checkAccountGG === 'yes') {
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.users.update({
          where: { id: userId },
          data: { password: hashedNewPassword, checkAccountGG: null },
        });
  
        return { success: true };
      }
  
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatch) {
        return { success: false, message: 'Current password is incorrect' };
      }
  
      if (currentPassword === newPassword) {
        return { success: false, message: 'New password cannot be the same as the current password' };
      }
  
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await this.prisma.users.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });
  
      return { success: true };
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, message: 'Error changing password' };
    }
  }
}