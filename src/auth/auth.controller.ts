import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { config } from "dotenv";
import { AuthService } from "./auth.service";
import { RegisterUserDto } from "./dto/register.dto";
import { LocalAuthGuard } from "./guards/local.guard";

config();

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @UseGuards(LocalAuthGuard)
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(AuthGuard("google"))
  @Get("google")
  async googleAuth() {
    return HttpStatus.OK;
  }

  @UseGuards(AuthGuard("google"))
  @Get("google-redirect")
  async googleAuthRedirect(@Request() req, @Res() res) {
    const result = this.authService.googleLogin(req);

    if (result.user) {
      const token = await this.authService.login(result.user);
      return res.redirect(
        `${process.env.FRONTEND_URL}/google/user/${token.accessToken}`
      );
    }

    return res.redirect(process.env.FRONTEND_URL);
  }
}
