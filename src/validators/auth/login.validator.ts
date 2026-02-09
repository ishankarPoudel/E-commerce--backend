import { IsNotEmpty, IsOptional, Length } from "class-validator";

export class LoginValidator {
  @IsNotEmpty()
  @Length(3, 20)
  email: string;

  @IsNotEmpty()
  @Length(6, 100)
  password: string;

  @IsOptional()
  rememberMe?: boolean;

  @IsOptional()
  os: string;

  @IsOptional()
  browser: string;

  @IsOptional()
  device: string;

  @IsOptional()
  location: string;
}
export class OTPValidator {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @Length(6, 6)
  otp: string;

  @IsOptional()
  browser: string;

  @IsOptional()
  os: string;

  @IsOptional()
  device: string;

  @IsOptional()
  location: string;
}
