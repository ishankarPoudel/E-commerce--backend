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
} from "tsoa";
import { RegisterUserDto } from "../../validators/registerUser.validator";
import { AuthService } from "../../services/auth/auth.service";
import { UserEntity } from "../../entities/user/userInfo/user.userInfo.entity";
import { ApiError } from "../../utils/apiError";
import { Request as ExpressRequest } from "express";
import { Response as ExpressResponse } from "express";
import {
  authenticateToken,
  AuthenticatedRequest,
} from "../../middlewares/auth.middleware";
import passport from "../../config/passport/passport.config";
import { Tokens } from "../../utils/token.util";
import bcrypt from "bcrypt";
import { TokensService } from "../../services/tokens/tokens.service";
import rateLimit from "express-rate-limit";
import { LoginValidator } from "../../validators/auth/login.validator";
import AppDataSource from "../../config/data-source/data-source";

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

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { message: "Too many requests, please try again later." },
});
@Route("/auth")
@Tags("Auth")
export class AuthController extends Controller {
  @Post("/verify-otp")
  @Middlewares(rateLimiter)
  async verifyOtp(@Body() { otp, email }: { otp: string; email: string }) {
    const { user, accessToken, refreshToken } =
      await new AuthService().verifyOtp({ otp, email });

    this.setHeader("Set-Cookie", [
      `accessToken=${accessToken}; HttpOnly; Path=/; SameSite=lax; Max-Age=900;`,
      `refreshToken=${refreshToken}; HttpOnly; Path=/; SameSite=lax; Max-Age=604800;`,
    ]);

    return {
      success: true,
      message: "Email verified successfully,  logging you in",
      data: {
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  @Post("/resend-otp")
  async resendOtp(@Body() { email }: { email: string }) {
    const otp = await new AuthService().resendOtp(email);
    return {
      success: true,
      message: "OTP resent successfully",
      data: {
        email,
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
  @Middlewares(rateLimiter)
  async loginUser(@Body() user: LoginValidator) {
    const { email } = user;
    const { accessToken, refreshToken } = await new AuthService().loginUser(
      user
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

  @Post("/logout")
  @Middlewares(authenticateToken)
  async logout(@Request() req: AuthenticatedRequest) {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    await new AuthService().logoutUser(req.user.id);
    this.setHeader("Set-Cookie", [
      `accessToken=; HttpOnly; Path=/; SameSite=lax; Max-Age=0;`,
      `refreshToken=; HttpOnly; Path=/; SameSite=lax; Max-Age=0;`,
    ]);
    return {
      success: true,
      message: "Logout successful",
    };
  }

  @Post("/reset-password")
  @Middlewares(rateLimiter)
  async resetPassword(@Body() { email }: { email: string }) {
    const { email: userEmail } = await new AuthService().resetPassword(email);

    return {
      success: true,
      message: "Password reset email sent",
      data: {
        email: userEmail,
      },
    };
  }

  @Post("/recover-password")
  @Middlewares(rateLimiter)
  async recoverPassword(
    @Body()
    { newPassword, resetToken }: { newPassword: string; resetToken: string }
  ) {
    const { email } = await new AuthService().recoverPassword(
      newPassword,
      resetToken
    );
    return {
      success: true,
      message: "Password reset successfully",
      data: {
        email,
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

    const newTokens = await new TokensService().refreshTokens(refreshToken);

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

  @Post("/revoke-session")
  async revokeUserSession(
    @Request() req: AuthenticatedRequest,
    @Body() body: { userId: string }
  ) {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    await new AuthService().revokeUserSession(body.userId);
    return {
      success: true,
      message: "User session revoked successfully",
    };
  }

  @Get("/google")
  async googleAuth(@Request() req: ExpressRequest) {
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })(req, req.res);
  }

  @Get("/google/callback")
  async googleCallBack(@Request() req: ExpressRequest): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      passport.authenticate(
        "google",
        async (err: Error, user: any, info: any) => {
          try {
            if (err || !user) {
              // Set redirect header using TSOA's method
              this.setHeader(
                "Location",
                `${process.env.FRONTEND_BASE_URL}/auth/login?error=oauth_failed`
              );
              this.setStatus(302);
              return resolve();
            }

            const { accessToken, refreshToken } =
              await new TokensService().generateTokens(user);

            // Set cookies using TSOA's setHeader
            this.setHeader("Set-Cookie", [
              `accessToken=${accessToken}; HttpOnly; Path=/; SameSite=lax; Max-Age=3600;`,
              `refreshToken=${refreshToken}; HttpOnly; Path=/; SameSite=lax; Max-Age=604800;`,
            ]);

            // Set redirect header using TSOA's method
            this.setHeader(
              "Location",
              `${process.env.FRONTEND_BASE_URL}/auth/login?success=oauth_success`
            );
            this.setStatus(302);

            resolve();
          } catch (error) {
            reject(error);
          }
        }
      )(req, req.res as ExpressResponse);
    });
  }
}
