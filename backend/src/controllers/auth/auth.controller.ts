import { Body, Controller, Post, Res, Route, Tags } from "tsoa";
import { RegisterUserDto } from "../../validators/registerUser.validator";
import { AuthService } from "../../services/auth/auth.service";
import { AppDataSource } from "./../../data-source";
import { GenerateRandomToken } from "../../utils/emailToken/randomToken";
import { UserEntity } from "../../entities/user/user.entity";
import { MailService } from "../../services/mail/mail.service";

export interface UserResponseData {
  email: string;
  fullName: string;
}
interface RegisterResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  data: {
    user: UserResponseData;
  };
}
@Route("/auth")
@Tags("Auth")
export class AuthController extends Controller {
  @Post("/send-verification-email")
  async sendVerificationEmail(@Body() { email }: { email: string }) {
    const userExists = await AppDataSource.getRepository(UserEntity).findOneBy({
      email,
    });
    if (userExists) {
      return {
        success: false,
        message: "User already exists",
      };
    }
    const token = new GenerateRandomToken().mailToken();
    await new MailService().sendVerificationEmail(email, token);
    return {
      success: true,
      message: "OTP sent to your email",
    };
  }
  @Post("/register")
  async registerUser(@Body() user: RegisterUserDto): Promise<RegisterResponse> {
    const { accessToken, refreshToken } = await new AuthService().registerUser(
      user
    );

    this.setHeader("Set-Cookie", [
      `accessToken=${accessToken}; HttpOnly; Path= "/"; SameSite= None; Secure`,
      `refreshToken=${refreshToken}; HttpOnly; Path= "/"; SameSite= None; Secure`,
    ]);

    return {
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          email: user.email,
          fullName: user.fullName,
        },
      },
    };
  }
}
