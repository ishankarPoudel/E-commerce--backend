import { Body, Controller, Post, Route, Tags } from "tsoa";
import { RegisterUserDto } from "../../validators/registerUser.validator";
import { AuthService } from "../../services/auth/auth.service";

@Route("/auth")
@Tags("Auth")
export class AuthController extends Controller {
  @Post("/register")
  async registerUser(@Body() user: RegisterUserDto) {
    const authService = await new AuthService().registerUser(user);
  }
}
