import { Injectable, BadRequestException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { RegisterUserDto } from "./dto/register.dto";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService
  ) {}

  generateJwt(payload) {
    return this.jwtService.sign(payload);
  }

  async register(dto: RegisterUserDto): Promise<{ message: string }> {
    // Check if username or email already exists by calling UserService
    const existingUser = await this.userService.findByEmail(dto.email);

    if (existingUser) {
      throw new BadRequestException("Email already in use.");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Save user to database
    await this.userService.createUser({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
    });

    return { message: "Registration successful!" };
  }

  async validateUser(email: string, password: string) {
    const findUser = await this.userService.findByEmail(email);
    if (!findUser) {
      throw new BadRequestException("Email is not registered.");
    }
    if (!(await bcrypt.compare(password, findUser.password))) {
      throw new BadRequestException("Password is incorrect.");
    }
    return findUser;
  }

  async validateUserGoogle(user: RegisterUserDto) {
    const findUser = await this.userService.findByEmail(user.email);
    if (!findUser) {
      this.register(user);
      this.login(user);
    }
    return findUser;
  }

  async login(user: { email: string; password: string }) {
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
