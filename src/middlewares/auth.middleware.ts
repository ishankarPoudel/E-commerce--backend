import { Request, Response, NextFunction } from "express";
import { Tokens } from "../utils/token.util";
import { ApiError } from "../utils/apiError";
import AppDataSource from "../config/data-source/data-source";
import {
  UserEntity,
  UserRole,
} from "../entities/user/userInfo/user.userInfo.entity";
import { TokenExpiredError } from "jsonwebtoken";
import { error } from "console";

export interface AuthUser {
  id: string;
  role: UserRole;
  tokenVersion: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Please login to continue",
        errorType: "guest_user",
        forceLogout: false, // forntend will  try refresh token at this point
        requiresAuth: true, // Indicates that this endpoint requires authentication
      });
    }

    let payload: any;
    try {
      payload = new Tokens().verifyAccessToken(accessToken);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return res.status(401).json({
          success: false,
          message: "Access Token expired",
          forceLogout: false, // frontend will try refresh token at this point
          errorType: "token_expired",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid Access Token",
        forceLogout: true,
        errorType: "invalid_token",
      });
    }

    const userRepo = AppDataSource.getRepository(UserEntity);
    const user = await userRepo.findOne({
      where: { id: payload.userId },
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        forceLogout: true,
        errorType: "user_not_found",
      });
    }
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned. Contact support.",
        forceLogout: true,
        errorType: "account_banned",
      });
    }

    if (payload.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: "Session has been revoked by administrator",
        forceLogout: true,
        errorType: "session_revoked",
      });
    }

    req.user = {
      id: payload.userId,
      role: payload.role,
      tokenVersion: payload.tokenVersion,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    next(error);
  }
};

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const authRq = req as AuthenticatedRequest;
    if (!authRq.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please login to continue",
        forceLogout: true,
        errorType: "guest_user",
      });
    }

    if (!allowedRoles.includes(authRq.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Insufficient permissions",
        errorType: "insufficient_permissions",
        forceLogout: false, // User is authenticated but not authorized
        requiredRole: allowedRoles,
        currentRole: authRq.user.role,
      });
    }

    next();
  };
};

export const revalidateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const userRepo = AppDataSource.getRepository(UserEntity);

  const user = await userRepo.findOne({
    where: { id: req.user!.id },
    select: ["id", "email", "isBanned", "tokenVersion"],
  });

  if (!user) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(401).json({
      success: false,
      message: "User not found",
      forceLogout: true,
      errorType: "user_not_found",
    });
  }

  if (user.isBanned) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(403).json({
      success: false,
      message: "Your account has been banned by an administrator",
      forceLogout: true,
      errorType: "account_banned",
    });
  }

  // ✅ Check token version mismatch
  if (user.tokenVersion !== req.user!.tokenVersion) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(401).json({
      success: false,
      message: "Your session has been revoked by an administrator",
      forceLogout: true,
      errorType: "session_revoked",
    });
  }
  next();
};
