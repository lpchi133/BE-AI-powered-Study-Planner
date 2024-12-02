import {
  Controller,
  Get,
  Request,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersService } from "./users.service";

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
}
