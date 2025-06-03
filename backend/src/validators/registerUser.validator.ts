import { IsEmail, IsNotEmpty, Length } from "class-validator";

export class RegisterUserDto {
  @IsNotEmpty()
  @Length(3, 16)
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(8, 16)
  password: string;
}
