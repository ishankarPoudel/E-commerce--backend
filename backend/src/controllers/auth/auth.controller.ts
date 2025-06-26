import { Body, Controller, Post, Request, Res, Route, Tags } from "tsoa";
import { RegisterUserDto } from "../../validators/registerUser.validator";
import { AuthService } from "../../services/auth/auth.service";
import { AppDataSource } from "./../../data-source";
import { GenerateRandomToken } from "../../utils/emailToken/randomToken";
import { UserEntity } from "../../entities/user/user.entity";
import { MailService } from "../../services/mail/mail.service";
import { ApiError } from "../../utils/apiError";
import { Request as ExpressRequest } from "express";

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
  @Post("/verify-otp")
  async verifyOtp(@Body() { otp }: { otp: string }) {
    const { user, accessToken, refreshToken } =
      await new MailService().verifyOtp(otp);

    this.setHeader("Set-Cookie", [
      `accessToken=${accessToken}; HttpOnly; Path=/; SameSite=None; Max-Age=3600;`,
      `refreshToken=${refreshToken}; HttpOnly; Path=/; SameSite=None; Max-Age=604800;`,
    ]);

    return {
      success: true,
      message: "Email verified successfully and logging you in",
      data: {
        email: user.email,
        fullName: user.fullName,
      },
    };
  }
  @Post("/register")
  async registerUser(@Body() user: RegisterUserDto): Promise<RegisterResponse> {
    const result = await new AuthService().registerUser(user);
    if (!result) throw new ApiError(400, "User registration failed");
    return {
      success: true,
      message: "OPT sent to your email",
      data: {
        user: {
          email: result.email,
          fullName: result.fullName,
        },
      },
    };
  }

  @Post("/login")
  async loginUser(@Body() user: { email: string; password: string }) {
    const { email, password } = user;
    const { accessToken, refreshToken } = await new AuthService().loginUser(
      email,
      password
    );

    this.setHeader("Set-Cookie", [
      `accessToken=${accessToken}; HttpOnly; Path=/; SameSite=None; Max-Age=3600;`,
      `refreshToken=${refreshToken}; HttpOnly; Path=/; SameSite=None; Max-Age=604800;`,
    ]);
    return {
      success: true,
      message: "Login successful",
      data: {
        user: {
          email,
          fullName:
            (await AppDataSource.getRepository(UserEntity).findOneBy({ email }))
              ?.fullName || "",
        },
      },
    };
  }

  @Post("/refresh-token")
  async refreshToken(@Request() req: ExpressRequest) {
    const refreshToken = req.cookies?.refreshToken;

    const newTokens = await new AuthService().refreshTokens(refreshToken);

    this.setHeader("Set-Cookie", [
      `accessToken=${newTokens.accessToken}; HttpOnly; Path=/; SameSite=None; Max-Age=3600;`,
      `refreshToken=${newTokens.refreshToken}; HttpOnly; Path=/; SameSite=None; Max-Age=604800;`,
    ]);
    return {
      success: true,
      message: "Tokens refreshed Successfully",
    };
  }
}
