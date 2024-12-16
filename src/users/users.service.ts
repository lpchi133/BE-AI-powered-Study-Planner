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

  async createTask(userId: number, data: { label: string; description: string; priority:string; status: string; start_date: string; start_time: string; date: string; time: string }) {
    const dateTimeSet = new Date(`${data.start_date}T${data.start_time}`);
    const dueDateTime = new Date(`${data.date}T${data.time}`);

    return this.prisma.task.create({
      data: {
        itemLabel: data.label,
        itemDescription: data.description,
        itemPriority: data.priority,
        itemStatus: data.status,
        dateTimeSet: dateTimeSet,
        dueDateTime: dueDateTime,
        userId: userId,
      },
    });
  }

  async getAllTasks(userId: number) {
    return this.prisma.task.findMany({
      where: { userId: userId },
    });
  }

  async deleteTask(taskId: number) {
    try {
      await this.prisma.task.delete({
        where: { id: taskId },
      });
      return { status: 'success' };
    } catch (error) {
      throw new Error(`Error deleting task: ${error.message}`);
    }
  }

  async updateTask(userId: number, data: { id: number; label: string; description: string; priority: string; status: string; start_date: string; start_time: string; date: string; time: string }) {
    const { id, label, description, priority, status, start_date, start_time, date, time } = data;
  
    // Kiểm tra xem date và time có hợp lệ không
    const dueDateTime = new Date(`${date}T${time}`);
    const dateTimeSet = new Date(`${start_date}T${start_time}`);

    if (isNaN(dueDateTime.getTime()) && isNaN(dateTimeSet.getTime())) {
      throw new Error('Invalid date or time');
    }
  
    try {
      const task = await this.prisma.task.findUnique({
        where: { id: id },
      });
  
      if (!task || task.userId !== userId) {
        throw new Error('Invalid user or task not found');
      }
  
      return this.prisma.task.update({
        where: { id: id },
        data: {
          itemLabel: label,
          itemDescription: description,
          itemPriority: priority,
          dateTimeSet: dateTimeSet,
          dueDateTime: dueDateTime,
          itemStatus: status,
        },
      });
    } catch (error) {
      throw new Error(`Error updating task: ${error.message}`);
    }
  }
  
}