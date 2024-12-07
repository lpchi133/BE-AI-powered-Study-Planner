import {
  Controller,
  Get,
  Post,
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
import { diskStorage } from 'multer';

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
    storage: diskStorage({
      destination: './uploads', // Thư mục lưu trữ tạm thời
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
      }
    })
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
      path: file.path,
    });

    const userId = req.user.id;
    const result = await this.usersService.updateProfilePicture(userId, file);
    if (result.success) {
      return res.json({ success: true, profilePictureUrl: result.profilePictureUrl });
    } else {
      return res.status(400).json({ success: false, message: 'Failed to update profile picture' });
    }
  }
}