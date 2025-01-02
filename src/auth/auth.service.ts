import { Injectable, BadRequestException  } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { RegisterUserDto } from "./dto/register.dto";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Users } from "@prisma/client";
import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private resend = new Resend(`${process.env.YOUR_RESEND_API_KEY}`);

  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  generateJwt(payload) {
    return this.jwtService.sign(payload);
  }

  async sendActivationEmail(email: string, activationLink: string, isActive: boolean) {
    try {
      const emailContent = isActive
        ? {
            subject: 'Account Already Active',
            html: `<p>Your account associated with this email is already active. No further action is needed.</p>`,
          }
        : {
            subject: 'Activate your account',
            html: `<p>Please click the following link to activate your account:</p><a href="${activationLink}">Activate Account</a>`,
          };
  
      await this.resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    } catch (error) {
      throw new BadRequestException('Failed to send activation email', error);
    }
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
    await this.sendActivationEmail(dto.email, activationLink, dto.isActive);

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
}
