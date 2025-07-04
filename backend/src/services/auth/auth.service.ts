import { TokenExpiredError } from "jsonwebtoken";
import { AppDataSource } from "../../config/data-source/data-source";
import { UserEntity } from "../../entities/user/user.entity";
import { ApiError } from "../../utils/apiError";
import { GenerateRandomToken } from "../../utils/emailToken/randomToken";
import { Tokens } from "../../utils/token.util";
import { MailService } from "../mail/mail.service";
import { RegisterUserDto } from "./../../validators/registerUser.validator";
import bcrypt from "bcrypt";

export class AuthService {
  private userRepo = AppDataSource.getRepository(UserEntity);

  async registerUser(user: RegisterUserDto) {
    let existingUser = await this.userRepo.findOne({
      where: {
        email: user.email,
      },
    });
    // If user is already fully registered
    if (existingUser && existingUser.isEmailVerified) {
      throw new ApiError(400, "User already exists");
    }

    if (!existingUser) {
      existingUser = this.userRepo.create({
        email: user.email,
        fullName: user.fullName,
        password: await bcrypt.hash(user.password, 10),
        isOauth: false,
        provider: "local",
        isEmailVerified: false,
      });
    } else {
      // Only update if not already set
      if (!existingUser.fullName) existingUser.fullName = user.fullName;
      if (!existingUser.password)
        existingUser.password = await bcrypt.hash(user.password, 10);
    }

    const otp = new GenerateRandomToken().mailToken();
    existingUser.emailVerificationToken = otp;
    existingUser.emailVerificationTokenExpiresAt = new Date(
      Date.now() + 15 * 60 * 1000
    ); // 15 minutes from now

    await this.userRepo.save(existingUser);

    await new MailService().sendVerificationEmail(existingUser.email, otp);

    return existingUser;
  }

  async loginUser(email: string, password: string) {
    const user = await this.userRepo.findOne({
      where: {
        email,
      },
    });
    if (!user) throw new ApiError(404, "User not found!");

    if (user.isOauth) {
      throw new ApiError(
        400,
        `This account was created using ${user.provider}. Please log in with that method.`
      );
    }
    if (!user.isEmailVerified) {
      throw new ApiError(
        403,
        "Email not verified. Please verify your email first."
      );
    }
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

  async refreshTokens(refreshToken: string) {
    if (!refreshToken) throw new ApiError(401, "Refresh Token missing");
    let payload: any;
    try {
      payload = new Tokens().verifyRefreshToken(refreshToken);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new ApiError(401, "Refresh Token expired");
      }
      throw new ApiError(401, "Invalid Refresh Token");
    }

    const user = await this.userRepo.findOne({
      where: {
        id: payload.userId,
      },
    });
    if (!user || !user.refreshToken)
      throw new ApiError(401, "User not found or refresh token missing");

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken
    );
    if (!isRefreshTokenValid) throw new ApiError(401, "Invalid Refresh Token");

    // Generate new tokens
    const newAccessToken = new Tokens().signAccessToken({ userId: user.id });
    const newRefreshToken = new Tokens().signRefreshToken({ userId: user.id });

    user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    await this.userRepo.save(user);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
