import {
  Controller,
  Get,
  Post,
  Put,
  Request,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  Res,
  UseGuards,
  Req,
  Body,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtMiddleware } from "../middlewares/jwt.middleware";
import { UsersService } from "./users.service";
import { Express } from "express";
import * as multer from "multer";

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

  @Post("changeAvt")
  @UseGuards(JwtMiddleware)
  @UseInterceptors(
    FileInterceptor("profilePicture", {
      storage: multer.memoryStorage(), // Sử dụng bộ nhớ trong bộ nhớ
    })
  )
  async changeProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
    @Res() res
  ) {
    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    // Ghi log thông tin của tệp
    console.log("File information:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    const userId = req.user.id;
    const result = await this.usersService.updateProfilePicture(userId, file);
    if (result.success) {
      return res.json({
        success: true,
        profilePictureUrl: result.profilePictureUrl,
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Failed to update profile picture" });
    }
  }

  @Put("update")
  @UseGuards(JwtMiddleware)
  async updateUser(@Req() req, @Body() body, @Res() res) {
    const userId = req.user.id;
    const { name, email } = body;

    const result = await this.usersService.updateUser(userId, { name, email });
    if (result.success) {
      return res.json({ success: true });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Failed to update user data" });
    }
  }

  @Put("changePassword")
  @UseGuards(JwtMiddleware)
  async changePassword(@Req() req, @Body() body, @Res() res) {
    const userId = req.user.id;
    const { currentPassword, newPassword } = body;

    const result = await this.usersService.changePassword(
      userId,
      currentPassword,
      newPassword
    );
    if (result.success) {
      return res.json({ success: true });
    } else {
      return res.status(400).json({ success: false, message: result.message });
    }
  }
}
