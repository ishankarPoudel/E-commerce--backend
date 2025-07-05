import {
  Body,
  Controller,
  Post,
  Request,
  Res,
  Route,
  Tags,
  Get,
  Middlewares,
  TsoaResponse,
} from "tsoa";
import { RegisterUserDto } from "../../validators/registerUser.validator";
import { AuthService } from "../../services/auth/auth.service";
import { AppDataSource } from "../../config/data-source/data-source";
import { UserEntity } from "../../entities/user/user.entity";
import { MailService } from "../../services/mail/mail.service";
import { ApiError } from "../../utils/apiError";
import { Request as ExpressRequest } from "express";
import { Response as ExpressResponse } from "express";
import {
  authenticateToken,
  AuthenticatedRequest,
} from "../../middlewares/auth.middleware";
import passport from "../../config/passport/passport.config";
import { Tokens } from "../../utils/token.util";

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
  async verifyOtp(@Body() { otp, email }: { otp: string; email: string }) {
    const { user, accessToken, refreshToken } =
      await new MailService().verifyOtp(otp, email);

    this.setHeader("Set-Cookie", [
      `accessToken=${accessToken}; HttpOnly; Path=/; SameSite=lax; Max-Age=3600;`,
      `refreshToken=${refreshToken}; HttpOnly; Path=/; SameSite=lax; Max-Age=604800;`,
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
      `accessToken=${accessToken}; HttpOnly; Path=/; SameSite=lax; Max-Age=3600;`,
      `refreshToken=${refreshToken}; HttpOnly; Path=/; SameSite=lax; Max-Age=604800;`,
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
    console.log("Refresh token endpoint called");
    console.log("Cookies:", req.cookies);
    console.log("Headers:", req.headers);

    const refreshToken = req.cookies?.refreshToken;
    console.log(
      "Extracted refresh token:",
      refreshToken ? "Present" : "Missing"
    );

    const newTokens = await new AuthService().refreshTokens(refreshToken);

    this.setHeader("Set-Cookie", [
      `accessToken=${newTokens.accessToken}; HttpOnly; Path=/; SameSite=lax; Max-Age=3600;`,
      `refreshToken=${newTokens.refreshToken}; HttpOnly; Path=/; SameSite=lax; Max-Age=604800;`,
    ]);

    console.log("New tokens generated and cookies set");

    return {
      success: true,
      message: "Tokens refreshed Successfully",
    };
  }

  @Get("/google")
  async googleAuth(@Request() req: ExpressRequest) {
    passport.authenticate("google", {
      scope: ["profile", "email"],
    });
  }

  @Get("/google/callback")
  async googleCallBack(@Request() req: ExpressRequest) {
    passport.authenticate("google", (err: Error, user: any) => {
      if (err || !user) {
        (req.res as ExpressResponse).redirect(
          `${process.env.FRONTEND_URL}/login?error=oauth_failed`
        );
        return;
      }
      const accessToken = new Tokens().signAccessToken({ userId: user.id });
      const refreshToken = new Tokens().signRefreshToken({ userId: user.id });
      this.setHeader("Set-Cookie", [
        `accessToken=${accessToken}; HttpOnly; Path=/; SameSite=lax; Max-Age=3600;`,
        `refreshToken=${refreshToken}; HttpOnly; Path=/; SameSite=lax; Max-Age=604800;`,
      ]);
      (req.res as ExpressResponse).redirect(
        `${process.env.FRONTEND_URL}/login?success=oauth_success`
      );
    })(req, req.res as ExpressResponse);
  }

  @Get("/me")
  @Middlewares(authenticateToken)
  async getCurrentUser(@Request() req: AuthenticatedRequest) {
    const user = req.user;
    return {
      success: true,
      message: "User data retrieved successfully",
      data: {
        email: user?.email,
        fullName: user?.fullName,
        id: user?.id,
      },
    };
  }
}
