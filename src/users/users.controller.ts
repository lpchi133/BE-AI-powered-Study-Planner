import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  Res,
  UseGuards,
  Req,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtMiddleware  } from '../middlewares/jwt.middleware';
import { UsersService } from "./users.service";
import { Express } from 'express';
import * as multer from 'multer';
import { format, toZonedTime  } from 'date-fns-tz';

@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get("profile")
  async getProfile(@Request() req) {
    if (!req.user) {
      throw new UnauthorizedException("Access denied");
    }
    const user = await this.usersService.getUserProfile(req.user.id);
    if (!user) {
      throw new UnauthorizedException("Access denied");
    }
    return user;
  }

  @Post('changeAvt')
  @UseGuards(JwtMiddleware)
  @UseInterceptors(FileInterceptor('profilePicture', {
    storage: multer.memoryStorage() // Sử dụng bộ nhớ trong bộ nhớ
  }))
  async changeProfilePicture(@UploadedFile() file: Express.Multer.File, @Req() req, @Res() res) {
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Ghi log thông tin của tệp
    console.log('File information:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    const userId = req.user.id;
    const result = await this.usersService.updateProfilePicture(userId, file);
    if (result.success) {
      return res.json({ success: true, profilePictureUrl: result.profilePictureUrl });
    } else {
      return res.status(400).json({ success: false, message: 'Failed to update profile picture' });
    }
  }

  @Post('createTask')
  @UseGuards(JwtMiddleware)
  async createTask(@Request() req, @Body() body) {
    if (!req.user) {
      throw new UnauthorizedException('Access denied');
    }

    const { label, description, priority, status, start_date, start_time, date, time } = body;
    if (!label || !description || !priority || !status || !start_date || !start_time || !date || !time) {
      throw new Error('All fields are required');
    }

    const userId = req.user.id;
    const task = await this.usersService.createTask(userId, body);
    return task;
  }

  @Get('tasks')
  @UseGuards(JwtMiddleware)
  async getAllTasks(@Request() req) {
    if (!req.user) {
      throw new UnauthorizedException('Access denied');
    }

    const userId = req.user.id;
    const tasks = await this.usersService.getAllTasks(userId);

    // Chuyển đổi `dueDateTime` sang giờ Việt Nam trước khi trả về
    const timeZone = 'Asia/Ho_Chi_Minh';
    const tasksWithVietnamTime = tasks.map(task => {
      const vietnamTime = toZonedTime (task.dueDateTime, timeZone);
      const vietnamTime1 = toZonedTime (task.dateTimeSet, timeZone);
      return {
        ...task,
        dueDateTime: format(vietnamTime, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone }),
        dateTimeSet: format(vietnamTime1, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone }),
      };
    });

    return tasksWithVietnamTime;
  }

  @Post('deleteTask')
  @UseGuards(JwtMiddleware)
  async deleteTask(@Request() req, @Body() body) {
    if (!req.user) {
      throw new UnauthorizedException('Access denied');
    }

    const taskId = body.id;
    if (!taskId) {
      throw new Error('Task ID is required');
    }

    try {
      const result = await this.usersService.deleteTask(taskId);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Post('updateTask')
  @UseGuards(JwtMiddleware)
  async updateTask(@Request() req, @Body() body) {
    if (!req.user) {
      throw new UnauthorizedException('Access denied');
    }

    const userId = req.user.id;
    const { id, label, description, priority, status, start_date, start_time, date, time  } = body;

    if (!id || !label || !description || !priority || !status || !start_date || !start_time || !date || !time) {
      throw new Error('All fields are required');
    }

    try {
      const result = await this.usersService.updateTask(userId, body);
      return { status: 'success', task: result };
    } catch (error) {
      return { error: error.message };
    }
  }
}