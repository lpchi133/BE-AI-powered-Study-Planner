import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {

    @IsString()
    currentPassword: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    newPassword: string;
}