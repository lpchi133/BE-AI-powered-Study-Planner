import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Put,
  Request,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { config } from "dotenv";
import { AuthService } from "./auth.service";
import { RegisterUserDto } from "./dto/register.dto";
import { LocalAuthGuard } from "./guards/local.guard";
import { ForgotPwDto } from "./dto/forgot-pw.dto";
import { ResetPwDto } from "./dto/reset-pw.dto";

config();

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) { }

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
        `${process.env.FRONTEND_URL}/google/user/${token.accessToken}`,
      );
    }

    return res.redirect(process.env.FRONTEND_URL);
  }

  @Post("forgot-password")
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async forgotPassword(@Body() forgotPwDto: ForgotPwDto) {
    return this.authService.forgotPassword(forgotPwDto.email);
  }

  @Put("reset-password")
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async resetPassword(@Body() resetPwDto: ResetPwDto) {
    return this.authService.resetPassword(
      resetPwDto.newPassword,
      resetPwDto.token,
    );
  }

  @Get("activate")
  async activateAccount(@Query('token') token: string) {
    await this.authService.activateAccount(token);
    return { message: 'Account activated successfully!' };
  }
}
