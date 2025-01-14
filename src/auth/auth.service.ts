import { Injectable, BadRequestException  } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { RegisterUserDto } from "./dto/register.dto";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Users } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import { MailService } from "../services/mail.service";


@Injectable()
export class AuthService {

  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,

  ) {}

  generateJwt(payload) {
    return this.jwtService.sign(payload);
  }

  async register(
    dto: RegisterUserDto,
  ): Promise<{ message: string; newUser: Users }> {
    const existingUser = await this.userService.findByEmail(dto.email);

    if (existingUser) {
      throw new BadRequestException("Email already in use.");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const activationToken = uuidv4();

    const user = await this.userService.createUser({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      checkAccountGG: dto.checkAccountGG,
      activationToken,
      isActive: dto.isActive,
    });

    const activationLink = `${process.env.FRONTEND_URL}/activate?token=${activationToken}`;
    await this.mailService.sendActivationEmail(dto.email, activationLink, dto.isActive);

    return { message: "Registration successful! Please check your email to activate your account.", newUser: user };
  }

  async activateAccount(token: string): Promise<void> {
    const user = await this.userService.findByActivationToken(token);

    if (!user) {
      throw new BadRequestException('Invalid activation token');
    }

    await this.userService.activateUser(user.id);
  }

  async validateUser(email: string, password: string) {
    const findUser = await this.userService.findByEmail(email);
    if (!findUser) {
      throw new BadRequestException("Email is not registered.");
    }
    if (!(await bcrypt.compare(password, findUser.password))) {
      throw new BadRequestException("Password is incorrect.");
    }
    if (!findUser.isActive) {
      throw new BadRequestException("Account is not activated. Please check your email to activate your account.");
    }
    return findUser;
  }

  async validateUserGoogle(user: RegisterUserDto) {
    let findUser = await this.userService.findByEmail(user.email);
    if (!findUser) {
      findUser = (await this.register(user)).newUser;
    }
    return findUser;
  }

  async login(user: { email: string; password: string }) {
    // const findUser = await this.validateUser(user.email, user.password);
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pass, ...payload } = user;
    return { accessToken: this.jwtService.sign(payload) };
  }

  googleLogin(req: { user: any }) {
    if (!req.user) {
      return null;
    }

    return {
      message: "User information from google",
      user: req.user,
    };
  }

  async forgotPassword(email: string) {
    //check that user exists
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException("Email not registered.");
    }

    if (!user.isActive) {
      throw new BadRequestException("Email not activated.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pass, ...payload } = user;
    const accessToken = this.jwtService.sign(payload);
    //generate pw reset link
    await this.mailService.sendPasswordResetEmail(email, accessToken);

    return { message: "Email sent." };
  }

  async resetPassword(newPassword: string, token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userService.findByEmail(payload.email);
      if (!user) {
        throw new BadRequestException("Email not found/ Email not registered.");
      }
      await this.userService.updatePassword(user.id, newPassword);
      return { message: "success" };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
      throw new BadRequestException("Invalid or expired token.");
    }
  }
}
