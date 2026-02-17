import {
  Body,
  Controller,
  Post,
  Request,
  Route,
  Tags,
  Get,
  Middlewares,
} from "tsoa";
import { RegisterUserDto } from "../../validators/registerUser.validator";
import { AuthService } from "../../services/auth/auth.service";
import { UserEntity } from "../../entities/user/userInfo/user.userInfo.entity";
import { ApiError } from "../../utils/apiError";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import {
  authenticateToken,
  AuthenticatedRequest,
} from "../../middlewares/auth.middleware";
import passport from "../../config/passport/passport.config";
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

interface VerifyOtpRequest {
  email: string;
  otp: string;
}

interface ResendOtpRequest {
  email: string;
}

interface ResetPasswordRequest {
  email: string;
}

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many requests, please try again later." },
});

@Route("/auth")
@Tags("Auth")
export class AuthController extends Controller {
  private getCookieOptions(maxAge: number) {
    const isProduction = process.env.NODE_ENV === "production";
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge,
      domain: isProduction ? ".shankarpoudel.com" : undefined,
    };
  }

  private setCookies(
    res: ExpressResponse,
    accessToken: string,
    refreshToken: string,
  ) {
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 300000, // 5 minutes
      domain: ".shankarpoudel.com",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1296000000, // 15 days
      domain: ".shankarpoudel.com",
    });
  }
  private clearCookies(res: ExpressResponse) {
    const isProduction = process.env.NODE_ENV === "production";
    const clearOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
      domain: isProduction ? ".shankarpoudel.com" : undefined,
      path: "/",
    };
    res.clearCookie("accessToken", clearOptions);
    res.clearCookie("refreshToken", clearOptions);
  }
  @Post("/verify-otp")
  @Middlewares(rateLimiter)
  async verifyOtp(
    @Body() body: VerifyOtpRequest,
    @Request() req: ExpressRequest,
  ) {
    const { otp, email } = body;
    console.log("opt code called with otp:", otp, "and email:", email);
    const { user, accessToken, refreshToken } =
      await new AuthService().verifyOtp({ otp, email });

    const res = req.res as ExpressResponse;
    this.setCookies(res, accessToken, refreshToken);

    return {
      success: true,
      message: "Email verified successfully, logging you in",
      data: {
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  @Post("/resend-otp")
  @Middlewares(rateLimiter)
  async resendOtp(@Body() body: ResendOtpRequest) {
    const { email } = body;
    await new AuthService().resendOtp(email);
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
      message: "OTP sent to your email",
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
  async loginUser(
    @Body() user: LoginValidator,
    @Request() req: ExpressRequest,
  ) {
    const { email } = user;
    const { accessToken, refreshToken } = await new AuthService().loginUser(
      user,
    );

    const res = req.res as ExpressResponse;
    this.setCookies(res, accessToken, refreshToken);

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

    const res = req.res as ExpressResponse;
    this.clearCookies(res);

    return {
      success: true,
      message: "Logout successful",
    };
  }

  @Post("/reset-password")
  @Middlewares(rateLimiter)
  async resetPassword(@Body() body: ResetPasswordRequest) {
    const { email } = body;
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
    @Body() body: { newPassword: string; resetToken: string },
    @Request() req: ExpressRequest,
  ) {
    const { newPassword, resetToken } = body;
    const { email } = await new AuthService().recoverPassword(
      newPassword,
      resetToken,
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

    const refreshToken = req.cookies?.refreshToken;
    const newTokens = await new TokensService().refreshTokens(refreshToken);

    const res = req.res as ExpressResponse;
    this.setCookies(res, newTokens.accessToken, newTokens.refreshToken);

    return {
      success: true,
      message: "Tokens refreshed successfully",
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
      const res = req.res as ExpressResponse;

      passport.authenticate(
        "google",
        async (err: Error, user: any, info: any) => {
          try {
            if (err || !user) {
              console.error(" Google OAuth failed:", err);

              res.redirect(
                `${process.env.FRONTEND_BASE_URL}/auth/login?error=oauth_failed`,
              );
              return resolve();
            }

            // Capture device info
            const userAgent = req.headers["user-agent"] || "";
            const ip =
              req.headers["x-forwarded-for"] || req.socket.remoteAddress;

            const userRepo = AppDataSource.getRepository(UserEntity);
            user.deviceInfo = {
              device: this.getDeviceType(userAgent),
              browser: this.getBrowser(userAgent),
              os: this.getOS(userAgent),
              location: await this.getLocation(ip as string),
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            await userRepo.save(user);

            const { accessToken, refreshToken } =
              await new TokensService().generateTokens(user);

            this.setCookies(res, accessToken, refreshToken);

            res.redirect(`${process.env.FRONTEND_BASE_URL}`);

            resolve();
          } catch (error) {
            console.error(" Error in Google callback:", error);
            res.redirect(
              `${process.env.FRONTEND_BASE_URL}/auth/login?error=server_error`,
            );
            reject(error);
          }
        },
      )(req, res);
    });
  }

  // Helper methods
  private getDeviceType(userAgent: string): string {
    if (/mobile/i.test(userAgent)) return "Mobile";
    if (/tablet/i.test(userAgent)) return "Tablet";
    return "Desktop";
  }

  private getBrowser(userAgent: string): string {
    if (/chrome/i.test(userAgent)) return "Chrome";
    if (/safari/i.test(userAgent)) return "Safari";
    if (/firefox/i.test(userAgent)) return "Firefox";
    if (/edge/i.test(userAgent)) return "Edge";
    return "Unknown";
  }

  private getOS(userAgent: string): string {
    if (/windows/i.test(userAgent)) return "Windows";
    if (/mac/i.test(userAgent)) return "macOS";
    if (/linux/i.test(userAgent)) return "Linux";
    if (/android/i.test(userAgent)) return "Android";
    if (/ios/i.test(userAgent)) return "iOS";
    return "Unknown";
  }

  private async getLocation(ip: string): Promise<string> {
    try {
      const response = await fetch(`http://ip-api.com/json/${ip}`);
      const data = await response.json();
      return JSON.stringify(data);
    } catch {
      return "{}";
    }
  }
}
