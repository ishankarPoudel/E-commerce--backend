import { AppDataSource } from "../../data-source";
import { UserEntity } from "../../entities/user/user.entity";
import { ApiError } from "../../utils/apiError";
import { Tokens } from "../../utils/token.util";
import { RegisterUserDto } from "./../../validators/registerUser.validator";
import bcrypt from "bcrypt";

export class AuthService {
  private userRepo = AppDataSource.getRepository(UserEntity);

  async registerUser(user: RegisterUserDto) {
    const existingUser = await this.userRepo.findOne({
      where: {
        email: user.email,
      },
    });
    if (!existingUser)
      throw new ApiError(
        400,
        "Please verify your email first with provided OTP"
      );

    if (existingUser.isEmailVerified) {
      throw new ApiError(400, "User with this email already exists");
    }

    existingUser.fullName = user.fullName;
    existingUser.password = await bcrypt.hash(user.password, 10);
    existingUser.isOauth = false;
    existingUser.provider = "local";
    existingUser.isEmailVerified = true;
    existingUser.emailVerificationToken = "";
    existingUser.emailVerificationTokenExpiresAt = null;

    await this.userRepo.save(existingUser);

    return this.generateTokens(existingUser);
  }

  async loginUser(email: string, password: string) {
    const user = await this.userRepo.findOne({
      where: {
        email,
      },
    });
    if (!user) throw new ApiError(404, "User not found");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

    return this.generateTokens(user);
  }

  async generateTokens(user: UserEntity) {
    const payload = { userId: user.id };
    const accessToken = new Tokens().signAccessToken(payload);
    const refreshToken = new Tokens().signRefreshToken(payload);

    //stored hashed refresh token in DB
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.save(user);

    return { accessToken, refreshToken };
  }
}
