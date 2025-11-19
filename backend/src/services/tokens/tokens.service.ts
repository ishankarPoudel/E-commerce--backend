import { TokenExpiredError } from "jsonwebtoken";
import { UserEntity } from "../../entities/user/userInfo/user.userInfo.entity";
import { ApiError } from "../../utils/apiError";
import { Tokens } from "../../utils/token.util";
import bcrypt from "bcrypt";
import AppDataSource from "../../config/data-source/data-source";

export class TokensService {
  private userRepo = AppDataSource.getRepository(UserEntity);

  async generateTokens(user: UserEntity) {
    const payload = { userId: user.id, tokenVersion: user.tokenVersion };
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

    if (user.isBanned) {
      throw new ApiError(403, "Your account has been banned. Contact support.");
    }
    if (payload.tokenVersion !== user.tokenVersion) {
      throw new ApiError(401, "Session has been revoked by administrator");
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken
    );
    if (!isRefreshTokenValid) throw new ApiError(401, "Invalid Refresh Token");

    // Generate new tokens
    const newAccessToken = new Tokens().signAccessToken({
      userId: user.id,
      tokenVersion: user.tokenVersion,
    });
    const newRefreshToken = new Tokens().signRefreshToken({
      userId: user.id,
      tokenVersion: user.tokenVersion,
    });

    user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    await this.userRepo.save(user);

    return {
      accessToken: newAccessToken,
      tokenVersion: user.tokenVersion,
      refreshToken: newRefreshToken,
    };
  }
}
