import { Request, Response, NextFunction } from "express";
import { Tokens } from "../utils/token.util";
import { ApiError } from "../utils/apiError";
import AppDataSource from "../config/data-source/data-source";
import { UserEntity } from "../entities/user/userInfo/user.userInfo.entity";

export interface AuthenticatedRequest extends Request {
  user?: UserEntity;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token missing",
      });
    }

    const tokenUtil = new Tokens();
    const payload = tokenUtil.verifyAccessToken(accessToken) as any;

    const userRepo = AppDataSource.getRepository(UserEntity);
    const user = await userRepo.findOne({
      where: { id: payload.userId },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (payload.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: "Session has been revoked. Please login again.",
        forceLogout: true,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Authentication errorsss:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};
