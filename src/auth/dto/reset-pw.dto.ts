import { IsString, MinLength } from "class-validator";

export class ResetPwDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
