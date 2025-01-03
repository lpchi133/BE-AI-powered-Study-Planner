import { IsEmail } from "class-validator";

export class ForgotPwDto {
  @IsEmail()
  email: string;
}
