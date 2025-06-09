import { Body, Controller, Post, Res, Route, Tags } from "tsoa";
import { RegisterUserDto } from "../../validators/registerUser.validator";
import { AuthService } from "../../services/auth/auth.service";

interface RegisterResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  data: Object;
}
@Route("/auth")
@Tags("Auth")
export class AuthController extends Controller {
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
